# Assessment exercise

Assessment exercise for backend and frontend developer, preconfigured to work with GitHub Codespaces.

# Feature Sviluppate

## 1. Toolbar Generale
- Implementazione responsive della toolbar che mostra automaticamente un menù a tendina sulla destra quando si raggiunge un determinato breakpoint.
- Selezionando una voce dal menù a tendina, viene aperta la relativa pagina.
- La toolbar è stata stilizzata utilizzando una palette di colori a tema.

## 2. Employee List Page (Frontend Exercise)

- **Visualizzazione Dati:**
  - Tabella per la visualizzazione dei dati provenienti dall'endpoint `api/employees/list`.

- **Funzionalità Aggiuntive:**
  - **Filtro:** composto da un selettore del campo di ricerca e una barra di ricerca con relativo pulsante. Consente di effettuare una ricerca mirata in uno specifico campo. La ricerca può essere avviata anche premendo il tasto Invio/Enter della tastiera, per una migliore user experience.
  - **Selettore Numero Record:** permette di selezionare il numero di record da impaginare
  - **Ordinamento Record:** è possibile ordinare in modo crescente o decrescente i record cliccando sulle intestazioni della tabella.
  - **Export XML:** pulsante dedicato che consente l'esportazione dei record visualizzati (filtrati e impaginati) in un file in formato XML.

- **Stile e Responsive:**
  - La pagina è stata stilizzata con una palette di colori a tema, ed è stato implementato un leggero responsive.

## 3. Customer List Page (Full Stack Exercise)

- **Implementazione Endpoint:**
  - E' stato creato un nuovo endpoint che permettesse di fetchare i dati dei Customers e delle Customers Categories, con determinati criteri di estrazione.

- **Visualizzazione Dati:**
  - Tabella per la visualizzazione dei dati provenienti dall'endpoint `api/customers/list`.

- **Funzionalità Aggiuntive:**
  - **Filtro:** barra di ricerca con relativo pulsante che consente una ricerca mirata nei campi `name` ed `email`. La ricerca può essere avviata anche premendo il tasto Invio/Enter della tastiera, per una migliore user experience.
  - **Selettore Numero Record:** permette di selezionare il numero di record mostrati per pagina.
  - **Ordinamento Record:** è possibile ordinare in modo crescente o decrescente i record cliccando sulle intestazioni della tabella.
  - **Export XML:** pulsante dedicato che consente l'esportazione dei record visualizzati (filtrati e impaginati) in un file in formato XML.

- **Stile e Responsive:**
  - La pagina è stata stilizzata con una palette di colori a tema, ed è stato implementato un leggero responsive.

