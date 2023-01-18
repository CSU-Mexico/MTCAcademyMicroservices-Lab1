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

6.- Clone el proyecto de forma local y vaya al proyecto de Expense API, vaya a la clase 
