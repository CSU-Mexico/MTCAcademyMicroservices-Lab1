# MTCAcademyMicroservices-Lab1

En este Laboratorio realizaremos las siguientes actividades: 
* Eliminar las dependencias directas de otros servicios (Notifications y Categories) usando Dapr (Patrón de Pub/Sub)
* Contenerizar cada uno de los microservicios

Como prerequisitos necesitamos: 
* Visual Studio Code [https://code.visualstudio.com/download]
* .Net 7 [https://dotnet.microsoft.com/en-us/download/dotnet/7.0]
* Dapr [https://docs.dapr.io/getting-started/install-dapr-cli/]
* nodejs [https://nodejs.org/en/download/]
* Java Development Kit [https://www.microsoft.com/openjdk]
* Extension Pack for Java [Extension Pack for Java]
* Spring Boot Extension Pack [Extension Pack for Java] 
* Docker Desktop [https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe]
* Subscripción de Azure
* SQL Server Management Studio [https://aka.ms/ssmsfullsetup]
* Postman [https://dl.pstmn.io/download/latest/win64]

Exiten 4 componentes:
* Portal de Expenses (Web - .Net 7)
* Expense API (WebAPI - .Net 7)
* Notification APU (API Rest - NodeJS)
* Category Catalog API (API Rest - Java Spring boot)

Puedes trabajar en todos los componentes o el que Elijas 

# Expense API

1.- Inicie sesión en el portal de Azure y crear un grupo de Recursos , nombralo con tus iniciales mas el posfijo "_rg" y selecciona la región SouthCentralUS ó East US2

![image](https://user-images.githubusercontent.com/31298167/213099891-3230f48d-677c-4f12-8190-b184f5cfb568.png)

2.- Cree un Azure SQL Database (single database), el server debe nombrarse con sus iniciales + el posfijo "-svr", SQL Authentication (indique su password y contraseñna), seleccione DTU como opcionde Compute + Storage,  agregue su IP al firewal de la base de datos y por ultimo agregue una base de datos y nombrela "expensedb"

![image](https://user-images.githubusercontent.com/31298167/213102018-cccc1145-050c-4c43-9d71-25985902a64d.png)

3.- Una vez creada la base de datos , ejecutamos el siguiente script SQL para crear la tabla de Expenses (puede realizarlo desde el Query Editor de la base de datos de Azure o desde SQL Management Studio):
```SQL
CREATE TABLE [dbo].[ExpenseRecord](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Date] [datetime] NULL,
	[Amount] [decimal](18, 2) NULL,
	[Category] [nvarchar](200) NULL,
 CONSTRAINT [PK_ExpenseRecord_Id] PRIMARY KEY NONCLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

```

4.- Cree un Azure Service Bus, nombrelo con sus iniciales y el posfijo "sb" , usando el tier "Standard" 
5.- Dentro de Azure Service Bus necesitamos crear un topic para enviar mensajes asincronos cada vez creeemos un nuevo Expense, para esto vamos a Entities -> Topics -> Create Topic, lo nombramos expenseTopic.
![image](https://user-images.githubusercontent.com/31298167/213103901-770f195c-57a5-4ca7-847e-a924e24b0ccf.png)

6.- Creamos dos suscripciones ("notificationSub" para el API de Notificaciones y "categorySub" otra para el API de Categorias) 1 mensaje maximo de entrega
7.- Agregamos un Shared access policy , lo nombramos "sbpolicy" y seleccionamos los scopes de "Send" y "Listen"
![image](https://user-images.githubusercontent.com/31298167/213104679-5f5b1c96-a4d0-49b7-8172-c9f72f6bcf89.png)

6.- Clone el proyecto de forma local y vaya al proyecto de Expense API, y en el Nuget package manager instalamos Dapr.AspNetCore

![image](https://user-images.githubusercontent.com/31298167/213105932-2c3ea650-17a5-41a2-9064-84187e942b9a.png)


7.- Posteriormente vamos a la clase ExpenseBusiness.cs y reemplazamos el metodo CreateExpenseRecord con el siguiente codigo: 
```CSHARP
        public async Task<ActionResult<bool>> CreateExpenseRecord(ExpenseRecord expenseRecord)
        {
            _context.ExpenseRecord.Add(expenseRecord);
            await _context.SaveChangesAsync();

            using var client = new DaprClientBuilder().Build();
            
            await client.PublishEventAsync("expensespubsub", "expenses", expenseRecord);

            return true;
        }
```

7.- Inicializa DAPR, abre una terminal y ejecuta el comando "dapr init", valida que le contenerdor esta ejecutandose en Docker Desktop o por linea de comandos con docker ps
8.- Ve al archivo  pubsub.yaml que se encuentra en "C:\Users\{tu User name}\.dapr\components" y lo reemplazamos con la siguiente especificación :
```YAML
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicebus-pubsub
spec:
  type: pubsub.azure.servicebus
  version: v1
  metadata:
  - name: connectionString # Required when not using Azure Authentication.
    value: "Endpoint=sb://{ServiceBusNamespace}.servicebus.windows.net/;SharedAccessKeyName={PolicyName};SharedAccessKey={Key};EntityPath={ServiceBus}"
  scopes:
   - expensenotificationservice
   - expensecatalogservice
   - expenseapi
```
9.- Reemplazamos con los datos que tenemos de nuestro recurso de Azure Servibus que creamos previamente

10.- en visual studio Code, abrimos una terminal ejecutamos los siguientes comando para restaurar paquetes y compilar:
```
dotnet restore
dotnet build
```

11.- ejecutamos losiguientes comandos :
```
dapr run --app-id expensesapi --components-path 'C:\Users\{tu User name}\.dapr\components' -- dotnet run

```
12.- probamos nuestra API y verificamos que envie el mensaje al Service Bus 
13.- procedemos a Contenerizar nuestro aplicativo, para esto agregamos un archivo llamado dockerfile con el siguiente contenido: 
```DOCKER
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["ExpenseApi/ExpenseApi.csproj", "ExpenseApi/"]
RUN dotnet restore "ExpenseApi/ExpenseApi.csproj"
COPY . .
WORKDIR "/src/ExpenseApi"
RUN dotnet build "ExpenseApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ExpenseApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ExpenseApi.dll"]
```
14.- Ejecutamos el siguiente comando para crear nuestra imagen, en la ruta donde se encuentra nuestro contenedor ejecutamos el siguiente comando: 
``` docker build --tag expenseapi .






