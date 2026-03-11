using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;

public class GuardarProducto
{
    private static readonly HttpClient _httpClient = new HttpClient();

    [Function("GuardarProducto")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
    {
        string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
        
        // 1. Preparamos el envío a Supabase
        var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("apikey", supabaseKey);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {supabaseKey}");

        // 2. Enviamos el dato a la tabla 'inventory'
        var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
        var responseSupabase = await _httpClient.PostAsync($"{supabaseUrl}/rest/v1/inventory", content);

        // 3. Respondemos al cliente (tu frontend)
        var response = req.CreateResponse(responseSupabase.StatusCode);
        return response;
    }
}

public class Producto {
    public string nombre { get; set; }
    public decimal cantidad { get; set; }
}