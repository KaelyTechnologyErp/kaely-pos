package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// App struct — exposed to frontend via Wails bindings
type App struct {
	ctx       context.Context
	agentURL  string
	token     string
	tenantID  string
	client    *http.Client
}

func NewApp() *App {
	return &App{
		agentURL: "http://localhost:3000",
		client:   &http.Client{Timeout: 10 * time.Second},
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) shutdown(ctx context.Context) {}

// --- Auth ---

type LoginResult struct {
	Success  bool   `json:"success"`
	Token    string `json:"token"`
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	FullName string `json:"full_name"`
	Role     string `json:"role"`
	Error    string `json:"error,omitempty"`
}

func (a *App) Login(username, password string) LoginResult {
	body := fmt.Sprintf(`{"username":"%s","password":"%s"}`, username, password)
	resp, err := a.post("/auth/login", body)
	if err != nil {
		return LoginResult{Error: err.Error()}
	}

	token, _ := resp["token"].(string)
	user, _ := resp["user"].(map[string]interface{})
	if token == "" {
		errMsg, _ := resp["error"].(string)
		return LoginResult{Error: errMsg}
	}

	a.token = token
	return LoginResult{
		Success:  true,
		Token:    token,
		UserID:   getString(user, "id"),
		Username: getString(user, "username"),
		FullName: getString(user, "full_name"),
		Role:     getString(user, "role"),
	}
}

func (a *App) PinLogin(pin string) LoginResult {
	body := fmt.Sprintf(`{"pin":"%s"}`, pin)
	resp, err := a.post("/auth/pin-login", body)
	if err != nil {
		return LoginResult{Error: err.Error()}
	}

	token, _ := resp["token"].(string)
	user, _ := resp["user"].(map[string]interface{})
	if token == "" {
		errMsg, _ := resp["error"].(string)
		return LoginResult{Error: errMsg}
	}

	a.token = token
	return LoginResult{
		Success:  true,
		Token:    token,
		UserID:   getString(user, "id"),
		Username: getString(user, "username"),
		FullName: getString(user, "full_name"),
		Role:     getString(user, "role"),
	}
}

func (a *App) Logout() {
	a.token = ""
}

// --- Products ---

type Product struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	SKU      string `json:"sku"`
	Barcode  string `json:"barcode"`
	Price    string `json:"price"`
	Cost     string `json:"cost"`
	TaxRate  string `json:"tax_rate"`
	Stock    string `json:"stock"`
	Category string `json:"category"`
	Unit     string `json:"unit"`
	ImageURL string `json:"image_url"`
}

func (a *App) SearchProducts(query string) []Product {
	resp, err := a.get(fmt.Sprintf("/catalog/search?q=%s", query))
	if err != nil {
		return nil
	}

	data, _ := resp["data"].([]interface{})
	var products []Product
	for _, item := range data {
		m, _ := item.(map[string]interface{})
		products = append(products, Product{
			ID:      getString(m, "id"),
			Name:    getString(m, "name"),
			SKU:     getString(m, "sku"),
			Barcode: getString(m, "barcode"),
			Price:   getString(m, "price"),
			Cost:    getString(m, "cost"),
			TaxRate: getString(m, "tax_rate"),
			Stock:   getString(m, "stock"),
			Unit:    getString(m, "unit"),
		})
	}
	return products
}

func (a *App) GetProductByBarcode(barcode string) *Product {
	resp, err := a.get(fmt.Sprintf("/catalog/barcode/%s", barcode))
	if err != nil {
		return nil
	}
	return &Product{
		ID:      getString(resp, "id"),
		Name:    getString(resp, "name"),
		SKU:     getString(resp, "sku"),
		Barcode: getString(resp, "barcode"),
		Price:   getString(resp, "price"),
		TaxRate: getString(resp, "tax_rate"),
		Stock:   getString(resp, "stock"),
		Unit:    getString(resp, "unit"),
	}
}

// --- Sales ---

type CartItem struct {
	ProductID   string `json:"product_id"`
	ProductName string `json:"product_name"`
	SKU         string `json:"sku"`
	Quantity    string `json:"quantity"`
	UnitPrice   string `json:"unit_price"`
	Discount    string `json:"discount"`
	TaxRate     string `json:"tax_rate"`
}

type Payment struct {
	Method   string `json:"method"`
	Amount   string `json:"amount"`
	Received string `json:"received"`
	Reference string `json:"reference"`
}

type SaleRequest struct {
	CustomerID string     `json:"customer_id"`
	Items      []CartItem `json:"items"`
	Payments   []Payment  `json:"payments"`
	Currency   string     `json:"currency"`
}

type SaleResult struct {
	Success       bool   `json:"success"`
	SaleID        string `json:"sale_id"`
	Total         string `json:"total"`
	Subtotal      string `json:"subtotal"`
	Tax           string `json:"tax"`
	PaymentMethod string `json:"payment_method"`
	Error         string `json:"error,omitempty"`
}

func (a *App) CreateSale(requestJSON string) SaleResult {
	resp, err := a.post("/pos/sale", requestJSON)
	if err != nil {
		return SaleResult{Error: err.Error()}
	}

	errMsg, _ := resp["error"].(string)
	if errMsg != "" {
		return SaleResult{Error: errMsg}
	}

	return SaleResult{
		Success:       true,
		SaleID:        getString(resp, "id"),
		Total:         getString(resp, "total"),
		Subtotal:      getString(resp, "subtotal"),
		Tax:           getString(resp, "tax"),
		PaymentMethod: getString(resp, "payment_method"),
	}
}

func (a *App) GetSales() string {
	resp, err := a.get("/pos/sales")
	if err != nil {
		return "[]"
	}
	data, _ := json.Marshal(resp)
	return string(data)
}

func (a *App) CancelSale(saleID, reason, pin string) map[string]interface{} {
	body := fmt.Sprintf(`{"cancelled_by":"pos","reason":"%s","pin":"%s"}`, reason, pin)
	resp, _ := a.post(fmt.Sprintf("/pos/sale/%s/cancel", saleID), body)
	return resp
}

// --- Cash Shifts ---

type ShiftInfo struct {
	ID            string `json:"id"`
	CashierName   string `json:"cashier_name"`
	Status        string `json:"status"`
	OpeningAmount string `json:"opening_amount"`
	TotalSales    string `json:"total_sales"`
	SalesCount    int    `json:"sales_count"`
	OpenedAt      string `json:"opened_at"`
}

func (a *App) OpenShift(cashierName, openingAmount string) map[string]interface{} {
	body := fmt.Sprintf(`{"cashier_name":"%s","opening_amount":"%s"}`, cashierName, openingAmount)
	resp, _ := a.post("/cashier/shift/open", body)
	return resp
}

func (a *App) CloseShift(closingAmount string) map[string]interface{} {
	body := fmt.Sprintf(`{"closing_amount":"%s"}`, closingAmount)
	resp, _ := a.post("/cashier/shift/close", body)
	return resp
}

func (a *App) GetCurrentShift() string {
	resp, err := a.get("/cashier/shift/current")
	if err != nil {
		return "{}"
	}
	data, _ := json.Marshal(resp)
	return string(data)
}

// --- Customers ---

func (a *App) SearchCustomers(query string) string {
	resp, err := a.get(fmt.Sprintf("/customer/search?q=%s", query))
	if err != nil {
		return "[]"
	}
	data, _ := json.Marshal(resp)
	return string(data)
}

func (a *App) GetCustomerBalance(customerID string) string {
	resp, err := a.get(fmt.Sprintf("/loyalty/balance/%s", customerID))
	if err != nil {
		return "{}"
	}
	data, _ := json.Marshal(resp)
	return string(data)
}

// --- Expenses ---

func (a *App) CreateExpense(expenseJSON string) map[string]interface{} {
	resp, _ := a.post("/expense/create", expenseJSON)
	return resp
}

// --- Health ---

func (a *App) GetHealth() string {
	resp, err := a.get("/health")
	if err != nil {
		return `{"status":"offline","error":"` + err.Error() + `"}`
	}
	data, _ := json.Marshal(resp)
	return string(data)
}

func (a *App) GetSyncStatus() string {
	resp, err := a.get("/health")
	if err != nil {
		return `{"pending_records":0,"status":"offline"}`
	}
	data, _ := json.Marshal(resp)
	return string(data)
}

// --- Config ---

func (a *App) SetAgentURL(url string) {
	a.agentURL = url
}

func (a *App) GetAgentURL() string {
	return a.agentURL
}

// --- HTTP helpers ---

func (a *App) get(path string) (map[string]interface{}, error) {
	req, err := http.NewRequest("GET", a.agentURL+path, nil)
	if err != nil {
		return nil, err
	}
	if a.token != "" {
		req.Header.Set("Authorization", "Bearer "+a.token)
	}
	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	return result, nil
}

func (a *App) post(path, jsonBody string) (map[string]interface{}, error) {
	req, err := http.NewRequest("POST", a.agentURL+path, nil)
	if err != nil {
		return nil, err
	}
	req.Body = io.NopCloser(io.Reader(nil))
	if jsonBody != "" {
		req, _ = http.NewRequest("POST", a.agentURL+path, io.NopCloser(
			io.Reader(nil),
		))
		req.Body = io.NopCloser(stringReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
	}
	if a.token != "" {
		req.Header.Set("Authorization", "Bearer "+a.token)
	}
	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(body, &result)
	return result, nil
}

func getString(m map[string]interface{}, key string) string {
	if m == nil {
		return ""
	}
	v, ok := m[key]
	if !ok || v == nil {
		return ""
	}
	s, ok := v.(string)
	if ok {
		return s
	}
	return fmt.Sprintf("%v", v)
}

type stringReaderWrapper struct {
	s string
	i int
}

func stringReader(s string) io.Reader {
	return &stringReaderWrapper{s: s}
}

func (r *stringReaderWrapper) Read(p []byte) (n int, err error) {
	if r.i >= len(r.s) {
		return 0, io.EOF
	}
	n = copy(p, r.s[r.i:])
	r.i += n
	return
}
