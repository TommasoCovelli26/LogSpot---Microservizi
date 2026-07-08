gruppi di risorse = logspot-rg

Azure service bus name = logspot-servicebus.servicebus.windows.net
argomento Azure service bus = logspot-events
sottoscrizione1 = catalog-sub
sottoscrizione2 = therapy-sub

SERVICE_BUS_CONNECTION_STRING da usare nelle variabili d'ambiente dei microservizi = la chiave si trova nel file .env nella root di progetto

container registry server di accesso = logspotregistry.azurecr.io
nome registro = logspotregistry
password1 = 2VXq0TqZrUyWJi1ytTdMW7fuUqCesZcZxG1l7BYjflVHHQas89pEJQQJ99CGACgEuAYEqg7NAAACAZCRVQX4
password2 = 2B3y4xL1Lvz01xGMhK8j8je3eOtaikHgLegTWL5Ur5ezUeEnI6KkJQQJ99CGACgEuAYEqg7NAAACAZCRgdMc

variabile ambientale MONGODB_URI = mongodb+srv://Tomm:<db_password>@cluster0.cymdcty.mongodb.net/?appName=Cluster0

PER I TEST IN TEAM: Se usiamo tutti e 4 lo stesso Service Bus e avviamo i nostri microservizi in locale contemporaneamente sui nostri 4 PC, il pattern 
che abbiamo creato (Topic + Subscription) per il therapy-service funziona a bilanciamento del carico. Se tu elimini un paziente dal tuo PC, l'evento parte.
Se tutti e 4 abbiamo il therapy-service acceso, solo uno di noi riceverà il messaggio e farà l'eliminazione a database. Il Service Bus distribuisce il lavoro
per non far fare la stessa operazione a 4 server diversi.

TEST SENZA DOCKER: Se stai sviluppando e vuoi avviare un singolo microservizio direttamente dal tuo IDE (IntelliJ IDEA o Eclipse) cliccando sul tasto "Play" verde,
l'IDE non leggerà il file .env automaticamente. Devi impostare la variabile nelle configurazioni di avvio su IntelliJ IDEA:
1. Clicca sul menu a tendina delle configurazioni in alto a destra (vicino al tasto Play verde) e scegli Edit Configurations....

2. Seleziona la tua applicazione Spring Boot (es. UserServiceApplication).

3. Trova il campo Environment variables (se non lo vedi, clicca su Modify options e aggiungilo).

4. Inserisci questo: AZURE_SERVICEBUS_CONNECTION_STRING= la chiave si trova nel file .env nella root di progetto.

5. Salva e avvia.