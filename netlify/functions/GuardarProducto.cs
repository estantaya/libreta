using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Newtonsoft.Json;
using System.Text;

public class GuardarProducto
{
    private static readonly HttpClient _httpClient = new HttpClient();
    
    // Obtenemos las variables una sola vez al iniciar la clase
    private readonly string _supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
    private readonly string _supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");

    private void ConfigurarHeaders() {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("apikey", _supabaseKey);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_supabaseKey}");
        _httpClient.DefaultRequestHeaders.Add("Prefer", "return=representation"); // Importante para Upsert
    }
    
    [Function("SincronizarTodo")]
    public async Task<HttpResponseData> SincronizarTodo([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        ConfigurarHeaders();
        
        var productos = JsonConvert.DeserializeObject<List<Producto>>(requestBody);

        foreach (var p in productos)
        {
            var json = JsonConvert.SerializeObject(p);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            // Usamos POST para insertar. Si quieres actualizar, Supabase requiere configuración adicional de PK
            await _httpClient.PostAsync($"{_supabaseUrl}/rest/v1/inventory", content);
        }

        var response = req.CreateResponse(HttpStatusCode.OK);
        await response.WriteStringAsync("Sincronización masiva exitosa");
        return response;
    }

    [Function("GuardarProducto")]
    public async Task<HttpResponseData> GuardarPrducto([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        ConfigurarHeaders();
        
        var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
        var responseSupabase = await _httpClient.PostAsync($"{_supabaseUrl}/rest/v1/inventory", content);

        var response = req.CreateResponse(responseSupabase.StatusCode);
        return response;
    }
}

public class Producto {
    public string nombre { get; set; }
    public decimal cantidad { get; set; }
    public DateTime fecha { get; set; }
    public string urgencia { get; set; }
}