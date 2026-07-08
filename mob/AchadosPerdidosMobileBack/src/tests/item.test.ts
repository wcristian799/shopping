describe("Testes de Itens", () => {
    const BASE_URL = "http://localhost:3000";
    
    test("GET /itens = 200", async () => {
        const res = await fetch(`${BASE_URL}/itens`);
        expect(res.status).toBe(200);
    });
});