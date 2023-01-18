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
* MySQL Workbench []

Exiten 4 componentes:
* Portal de Expenses (Web - .Net 7)
* Expense API (WebAPI - .Net 7)
* Notification API (API Rest - NodeJS)
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

8.- Clone el proyecto de forma local y vaya al proyecto de Expense API, y en el Nuget package manager instalamos Dapr.AspNetCore

![image](https://user-images.githubusercontent.com/31298167/213105932-2c3ea650-17a5-41a2-9064-84187e942b9a.png)


9.- Posteriormente vamos a la clase ExpenseBusiness.cs y reemplazamos el metodo CreateExpenseRecord con el siguiente codigo: 
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

10.- Inicializa DAPR, abre una terminal y ejecuta el comando "dapr init", valida que le contenerdor esta ejecutandose en Docker Desktop o por linea de comandos con docker ps
11.- Ve al archivo  pubsub.yaml que se encuentra en "C:\Users\{tu User name}\.dapr\components" y lo reemplazamos con la siguiente especificación :
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
   - notificationSub
   - categorySub
   - expenseapi
```
12.- Reemplazamos con los datos que tenemos de nuestro recurso de Azure Servibus que creamos previamente

13.- en visual studio Code, abrimos una terminal ejecutamos los siguientes comando para restaurar paquetes y compilar:
```
dotnet restore
dotnet build
```

14.- ejecutamos losiguientes comandos :
```
dapr run --app-id expensesapi --components-path 'C:\Users\{tu User name}\.dapr\components' -- dotnet run

```
15.- probamos nuestra API y verificamos que envie el mensaje al Service Bus 
16.- procedemos a Contenerizar nuestro aplicativo, para esto agregamos un archivo llamado dockerfile con el siguiente contenido: 
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
17.- Ejecutamos el siguiente comando para crear nuestra imagen, en la ruta donde se encuentra nuestro contenedor ejecutamos el siguiente comando: 
``` 
docker build --tag expenseapi .
```
# Notification API (Node JS)
1.- Vamos a el portal de azure , creamos un recurso Azure Database for MySQL, seleccionamos flexibl server, nombramos con nuestras iniciales mas el posfijo mysql, seleccionamos el tipo de carga para proositos de desarrollo, agregamos nuestra IP
2.- Ingresamos al recurso y creamos una base de datos llamada "expensenotificaciondb"
3.- Ejecutamos el siguiente script para crear la tabla en la base de datos 
```SQL
CREATE TABLE `notification` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notificationDate` datetime DEFAULT NULL,
  `expenseId` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3;
```
4.- Es importante mencionar que es necesario ejecutar el paso 4,5,6,10,11 de la seccion de Expense API
5.- Abrimos el projecto de API llamado ExpenseAPINode en Visual Studio Code e instalamos el paquete npm "@dapr/dapr" y en el archivo package.json modificamos la sección de scripts con el siguiente segmento: 
``` 
  "scripts": {    
    "build": "tsc --build",
    "clean": "tsc --build --clean",
    "start": "tsc && node server.js",
    "start:dapr": "dapr run --app-port 5001 --app-id expensenotificationservice --app-protocol http --dapr-http-port 3501 --components-path 'C://Users//erramire//.dapr//components' -- npm run start"
  },
```
6.- Eliminamos la carpeta de Routes en el proyecto
7.- Remplazamos el codigo de archivo expenseNotificationController.ts con lo siguiente: 
```Node
import { Request, Response, NextFunction } from 'express'; 
const util = require("util"); 
const mysql = require('mysql');
const sendgrid = require('@sendgrid/mail');

interface Notification {    
    NotificationDate: Date;
    ExpenseId: Number;
}

interface ExpenseRecord {
    id: Number;
    date: Date;
    amount: Number;
    category: String;

}

//use email service
function sendEmail(date: Date, amount: Number, category: String) {
    let result: boolean = false;
    const SENDGRID_API_KEY = "XXXXXXX"

    sendgrid.setApiKey(SENDGRID_API_KEY);
    const content = `<strong> Fecha : ${date}- Monto: $ ${amount.toString()} - Concepto: ${category} </strong>`;  

    const msg = {
        to: 'XXXX@XXX.com',
        // Change to your recipient
        from: 'mtcacademyms@outlook.com',
        // Change to your verified sender
        subject: 'Gasto Registrado ',
        text: `Acabas de realizar un gasto por $ ${amount.toString()} `,
        html: content,
    }
    sendgrid
        .send(msg)
        .then((resp) => {
            console.log('Email sent\n', resp)
        })
        .catch((error) => {
            console.error(error)
        })
    result = true;
    return result;
}

//register in database 
async function registerExpensesNotification (notification: Notification){

    let result:boolean = false;
    
    var connection = mysql.createConnection({
        host: "XXXX.mysql.database.azure.com",
        port:"3306",
        user: "adminadmin",
        password: "XXX",
        database: "expensenotificationdb"
    });

    connection.query = util.promisify(connection.query).bind(connection);

    connection.connect(function (err) {
        if (err) {
            console.log("error connecting: " + err.stack);
            return;
        };
        console.log("connected as... " + connection.threadId);
    });
    
    const postQueryString = `INSERT INTO expensenotificationdb.notification  (NotificationDate, ExpenseId) VALUES (' ${formatDate(notification.NotificationDate)}',${notification.ExpenseId.toString() } )`;  

    const resultquery = await connection.query(postQueryString).catch(err => { throw err });
    
    result = true;
    return result;
};

async function sendExpenseNotification(data:string) {
    let expense: ExpenseRecord = JSON.parse(data);
    let date: Date = expense.date;
    let amount: Number = expense.amount;
    let category: String = expense.category;
    let id: Number = expense.id
    // sending the email notification

    let resultEmail = sendEmail(date, amount, category);


    let currentDate = new Date(Date.now());;

    let notification: Notification = {
        NotificationDate: currentDate,
        ExpenseId: id
    };

    let resultRegister = await registerExpensesNotification(notification);

}


function formatDate(date: Date) {
    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-') +
        ' ' +
        [
            padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
        ].join(':')
    );
}

function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export default { sendExpenseNotification };
```
8.- En el archivo server.ts reemplazamos con el siguiente codigo:
```
import { DaprServer } from '@dapr/dapr';
import controller from './controllers/expenseNotificationController';

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3501";
const SERVER_HOST = process.env.SERVER_HOST || "127.0.0.1";
const SERVER_PORT = process.env.APP_PORT || '5002';

async function main() {
    const server = new DaprServer(SERVER_HOST, SERVER_PORT, DAPR_HOST, DAPR_HTTP_PORT);

    // Dapr subscription routes orders topic to this route
    server.pubsub.subscribe("servicebus-pubsub", "expensetopic", async (data) => {
        console.log("Subscriber received: " + JSON.stringify(data));
        controller.sendExpenseNotification(JSON.stringify(data));
    });

    await server.start();
}

main().catch(e => console.error(e));
```
9.- Compilamos con el comando npm run build y posteriormente ejecutamos el siguiente comando: 
```
dapr run --app-port 5001 --app-id notificationSub --app-protocol http --dapr-http-port 3501 --components-path 'C:\Users\{username}\.dapr\components' -- npm run start
```

10.- Una vez que funciono correctamente procedemos a agregar el achivo Dockerfile con el siguiente contenido: 
```
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 5001
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
```

11.- Nos posicionamos en una terminar en el directorio donde se encuentra nuestro proyecto y creamos la imagen con el siguiente comando : 
``` 
docker build --tag expensenotificationapi .
```

# Category Catalog API (Java Spring Boot)





