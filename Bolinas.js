const scarica = () => {
    return new Promise((resolve, reject) => {
      fetch('https://ws.cipiaceinfo.it/cache/get', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          key: myToken,
        },
        body: JSON.stringify({
          key: myKey,
        }),
      })
        .then((r) => r.json())
        .then((r) => {
          // Verifica se r.result è un array
          if (Array.isArray(r.result)) {
            lista = r.result;  // Assegna il valore solo se è un array
          } else {
            lista = [];  // Se non è un array, inizializza come array vuoto
            console.warn("Risultato non è un array, inizializzato lista a vuoto.");
          }
          console.log(lista);
          resolve();
        })
        .catch((error) => {
          console.error("Errore durante il download:", error);
          reject(error);
        });
    });
  };  
  
  const gestioneTabella = () => {
    return {
      render: () => {
        let html = '';
        lista.forEach((element) => {
          let row = `<tr><td>${element[0]}</td><td>${element[1]}</td><td>${element[2]}</td><td>${element[3]}</td></tr>`;
          html += row;
        });
        const header ='<tr><th>Data</th><th>Singole</th><th>Doppie</th><th>Suite</th></tr>';
        tabella.innerHTML = header + html;
      },
      add: (data, singole, doppie, suite) => {
        if (!Array.isArray(lista)) {
          lista = [];  // Forza lista ad essere un array se non lo è
        }
        lista.push([data, singole, doppie, suite]);
        console.log(lista);
        fetch('https://ws.cipiaceinfo.it/cache/set', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            key: myToken,
          },
          body: JSON.stringify({
            key: myKey,
            value: lista,
          }),
        }).then((r) => r.json())
          .then((r) => {
            console.log(r.result); // se tutto è ok, stamperà "ok"
            scarica().then(() => {
              funzione.render();
            });
          });
      },
    };
  };
  
  const createForm = (parentElement) => {
    let data;
    return {
      setLabels: (labels) => {
        data = labels;
      },
      onsubmit: (callbackInput) => {
        callback = callbackInput;
      },
      render: () => {
        parentElement.innerHTML =data.map((name) => {
              if (name == 'Data') {
                return `<div>${name}\n<input id="${name}" type="text" /></div>`;
              } else {
                return `<div>${name}\n<input id="${name}" type="number" /></div>`;
              }
            }).join('\n') + "<button type='button' id='submit'>Submit</button>";
        document.querySelector('#submit').onclick = () => {
          const result = data.map((name) => {
            return document.querySelector('#' + name).value;
          });
          funzione.add(result[0],parseInt(result[1]),parseInt(result[2]),parseInt(result[3]));
        };
      },
    };
  };
  
  const tabella = document.getElementById('table');
  let lista = [];
  const myToken = '3f69d78a-4667-4c9a-a383-1ef9fafccc56'; // token ottenuto via mail
  const myKey = 'Albergo'; // sostituire con chiave di propria preferenza
  const form = createForm(document.getElementById('form'));
  const funzione = gestioneTabella();
  form.setLabels([
    'Data',
    'Singole',
    'Doppie',
    'Suite'
  ]);
  scarica().then(() => {
    funzione.render(); // Renderizza la tabella dopo che i dati sono stati scaricati
  });
  funzione.render();
  form.render();