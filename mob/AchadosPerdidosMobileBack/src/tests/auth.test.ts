describe("Autenticação", () => {
    const BASE_URL = "http://localhost:3000";

    test("POST /auth/login = 200", async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin@iguatemi.com.br",
                senha: "admin123"
            })
        });
        
        console.log("STATUS:", res.status);
        
        const data = await res.json();
        console.log("RESPOSTA COMPLETA:", JSON.stringify(data, null, 2));
        
        expect(res.status).toBe(200);
    });
});