let disponibilita = {}

const genera_array = () => {
  disponibilita = {}
  for (let i = 0; i < 30; i++){
      let data = new Date();
      data.setDate(data.getDate() + i);
      data = data.getUTCDate() + "/" + data.getMonth() + "/" + data .getFullYear();
      disponibilita[data]=[10,5,3];
  }
  console.log(disponibilita)
}

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
        console.log(r);
        disponibilita = r.result;
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
      for (let data in disponibilita) {
        let row = `<tr><td>${data}</td><td>${disponibilita[data][0]}</td><td>${disponibilita[data][1]}</td><td>${disponibilita[data][2]}</td></tr>`;
        html += row;
      }
      const header = '<tr><th>Data</th><th>Singole</th><th>Doppie</th><th>Suite</th></tr>';
      tabella.innerHTML = header + html;
    },
    modifica: (data, singole, doppie, suite) => {
      let found = false;
      for (let key in disponibilita) {
        console.log(key);
        if (key === data) {
          found = true;
          if (disponibilita[key][0] - singole >= 0 && disponibilita[key][1] - doppie >= 0 && disponibilita[key][2] - suite >= 0) {
            disponibilita[key][0] -= singole;
            disponibilita[key][1] -= doppie;
            disponibilita[key][2] -= suite;
          };
          funzione.render();
          fetch('https://ws.cipiaceinfo.it/cache/set', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              key: myToken,
            },
            body: JSON.stringify({
              key: myKey,
              value: disponibilita,
            }),
          }).then((r) => r.json())
            .then((r) => {
              console.log(r.result);
              scarica().then(() => {
                funzione.render();
              });
            });
        };
      };
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
        funzione.modifica(result[0],parseInt(result[1]),parseInt(result[2]),parseInt(result[3]));
      };
    },
  };
};

const tabella = document.getElementById('table');
const myToken = '3f69d78a-4667-4c9a-a383-1ef9fafccc56';
const myKey = 'Albergo';
const form = createForm(document.getElementById('form'));
const funzione = gestioneTabella();
form.setLabels([
  'Data',
  'Singole',
  'Doppie',
  'Suite'
]);
let ultimaDataGenerazione = localStorage.getItem('ultimaDataGenerazione') || '';
const oggi = new Date();
const dataOggi = oggi.getUTCDate() + "/" + oggi.getMonth() + "/" + oggi.getFullYear();
if (dataOggi !== ultimaDataGenerazione) {
  console.log("Generazione di nuove disponibilità perché è passato un giorno.");
  genera_array();
  localStorage.setItem('ultimaDataGenerazione', dataOggi);
} else {
  console.log("Stessa giornata, non è necessaria la generazione.");
}
scarica().then(() => {
  funzione.render();
});
genera_array();
form.render();