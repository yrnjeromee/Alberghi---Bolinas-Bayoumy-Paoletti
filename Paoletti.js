/// 30 giorni da oggi
function genera_array () {
    let disponibilita = {};
    for(let i = 0; i < 30; i ++){
        let data = new Date();
        data.setDate(data.getDate() + i);
        data = data.getUTCDate() + "/" + data.getMonth() + "/" + data.getFullYear();
        disponibilita[data]=[10,5,3];
        console.log(data);
    }
    console.log(disponibilita)
}

genera_array();