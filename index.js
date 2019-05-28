var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "Stage"), {disableLosslessIntegers: true});

const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/views/'));

app.get('/', function(req, res) {
  res.redirect("Partecipazione");
});

app.get('/Partecipazione', function(req, res) {

  var query1 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE r.evento = 'Inviato tentativo quiz' " +
  " OR q.contesto = 'S' " +
  " RETURN r.mese, size(collect(r.mese)) " +
  " ORDER BY r.mese "
  ;
  var data1 = [['Mesi','Tentativi Inviati']];

  var query2 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE r.evento = 'Inviato tentativo quiz' " +
  " OR q.contesto = 'S' " +
  " RETURN r.settimana, size(collect(r.settimana)) " +
  " ORDER BY r.settimana "
  ;
  var data2 = [['Settimane','Tentativi Inviati']];

  var session = driver.session();

  function q1() {
    return session
    .run(query1)
    .then(function (result) {
      result.records.forEach(function (record) {
        data1.push([record.get("r.mese"),record.get("size(collect(r.mese))")]);
      });  
    });
  }
  function q2() {
    return session
    .run(query2)
    .then(function (result) {
      result.records.forEach(function (record) {
        data2.push([record.get("r.settimana"),record.get("size(collect(r.settimana))")]);
      });
      res.render("Partecipazione.ejs", {
        gmesi: JSON.stringify(data1),
        gsettimane: JSON.stringify(data2)
      });
    });
  }

  q1()
  .then(q2)
  .then(session.close());

});

app.get('/PartecipazioneForm', function(req, res) {

  var selected;

  if( req.query.SelTempo == "Filtro Mesi" ) {
    selected = "Filtro Mesi";
    var SelTempo = "mese";
  }
  else if( req.query.SelTempo == "Filtro Settimane" ) {
    selected ="Filtro Settimane";
    var SelTempo = "settimana";
  }
  else {
    selected = "Di Sempre";
    var SelTempo = "Di Sempre";
  } 

  var Filtro = 0;

  if( SelTempo == "mese" ) {
    if( req.query.Filtro >= 1 && req.query.Filtro <= 12 ) {
      Filtro = parseInt(req.query.Filtro);
    }
  }

  if( SelTempo == "settimana" ) {
    if( req.query.Filtro >= 1 && req.query.Filtro <= 52 ) {
      Filtro = parseInt(req.query.Filtro);
    }
  }

  if ( Filtro > 0 ) {
    query1 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE ( r.evento = 'Inviato tentativo quiz' " +
    " OR q.contesto = 'S' ) " +
    " AND r." + SelTempo + " = $Filtro" +
    " RETURN r.giorno, size(collect(r.giorno)) " +
    " ORDER BY r.giorno "
    ;
    query3 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE ( r.evento = 'Inviato tentativo quiz' " +
    " OR q.contesto = 'S' ) " +
    " AND r." + SelTempo + " = $Filtro" +
    " RETURN r.ora, size(collect(r.ora)) " +
    " ORDER BY r.ora "
    ;
    query4 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE ( r.evento = 'Inviato tentativo quiz' " +
    " OR q.contesto = 'S' ) " +
    " AND r." + SelTempo + " = $Filtro" +
    " RETURN q.nome, size(collect(q.nome)) "
    ;
  }
  else {
    query1 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE r.evento = 'Inviato tentativo quiz' " +
    " OR q.contesto = 'S' " +
    " RETURN r.giorno, size(collect(r.giorno)) " +
    " ORDER BY r.giorno "
    ;
    query3 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE r.evento = 'Inviato tentativo quiz' " +
    " OR q.contesto = 'S' " +
    " RETURN r.ora, size(collect(r.ora)) " +
    " ORDER BY r.ora "
    ;
    query4 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE r.evento = 'Inviato tentativo quiz' " +
    " OR q.contesto = 'S' " +
    " RETURN q.nome, size(collect(q.nome)) "
    ;
  }

  data1 = [['Giorni','Tentativi Inviati']];
  data1a = [];
  data2 = [['Parti Settimana','Tentativi Inviati']];
  data3 = [['Ore','Tentativi Inviati']];
  data3a = [];
  data3b = [];
  data4 = [['Quiz','Tentativi Inviati']];
  data4b = [['Capitoli','Tentativi Inviati']];
  data4a = [];
  data5 = [['Parti','Tentativi Inviati']];
  data6 = [['Tipo','Tentativi Inviati']];

  var session = driver.session();

  function q1() {
    return session
    .run(query1,{Filtro: Filtro})
    .then(function (result) {
      result.records.forEach(function (record) {
        data1a.push([record.get("r.giorno"),record.get("size(collect(r.giorno))")]);
      });
      var j; var trovato;
      for ( i = 1 ; i <= 7 ; i++ ) {
        j = 0;
        trovato = false;
        while( trovato == false && j < data1a.length ) {
          if( data1a[j][0] == i ) 
            trovato = true;
          else j++;
        }
        if ( trovato == false )
          data1.push(['' + i + '',0]);
        else 
          data1.push(['' + i + '' , data1a[j][1]]);
      }
      var s1 = 0;
      for(i = 1 ; i <= 5 ; i++) {
        s1 = s1 + data1[i][1];
      }
      s2 = data1[6][1] + data1[7][1];
      data2.push(['Lun-Ven',s1]);
      data2.push(['Sab-Dom',s2]);
    });
  }
  
  function q3() {
    return session
    .run(query3,{Filtro: Filtro})
    .then(function (result) {
      result.records.forEach(function (record) {
        data3a.push([record.get("r.ora"),record.get("size(collect(r.ora))")]);
      });
      var j; var trovato;
      for ( i = 0 ; i < 24 ; i++ ) {
        j = 0;
        trovato = false;
        while( trovato == false && j < data3a.length ) {
          if( data3a[j][0] == i ) 
            trovato = true;
          else j++;
        }
        if ( trovato == false )
          data3b.push(['' + i + '',0]);
        else 
          data3b.push(['' + i + '' , data3a[j][1]]);
      }
      var s1 = 0;
      for(i = 0 ; i < 6 ; i++ )
        s1 = s1 + data3b[i][1];
      var s2 = 0;
      for(i = 6 ; i < 12 ; i++ )
        s2 = s2 + data3b[i][1];
      var s3 = 0;
      for(i = 12 ; i < 18 ; i++ )
        s3 = s3 + data3b[i][1];
      var s4 = 0;
      for(i = 18 ; i < 24 ; i++ )
        s4 = s4 + data3b[i][1];
      data3.push(['Mattina',s2]);
      data3.push(['Pom',s3]);
      data3.push(['Sera',s4]);
      data3.push(['Notte',s1]);
    });
  }

  function q4() {
    return session
    .run(query4,{Filtro: Filtro})
    .then(function (result) {
      result.records.forEach(function (record) {
        data4a.push([record.get("q.nome"),record.get("size(collect(q.nome))")]);
      });
      var j; var trovato;
      var v = ["1T","2E","2T","3E","3T","4T","5E","5T","6E","6T","7E","7T","8E","1PST","1PSE","2PST","2PSE"];
      for ( i = 0 ; i < 17 ; i++ ) {
        j = 0;
        trovato = false;
        while( trovato == false && j < data4a.length ) {
          if( data4a[j][0] == v[i] ) 
            trovato = true;
          else j++;
        }
        if ( trovato == false )
          data4.push([v[i],0]);
        else 
          data4.push([v[i],data4a[j][1]]);
      }
      data4b.push(["1C",data4[1][1]]);
      data4b.push(["2C",data4[2][1] + data4[3][1]]);
      data4b.push(["3C",data4[4][1] + data4[5][1]]);
      data4b.push(["4C",data4[6][1]]);
      data4b.push(["5C",data4[7][1] + data4[8][1]]);
      data4b.push(["6C",data4[9][1] + data4[10][1]]);
      data4b.push(["7C",data4[11][1] + data4[12][1]]);
      data4b.push(["8C",data4[13][1]]);
      data4b.push(["1S",data4[14][1] + data4[15][1]]);
      data4b.push(["2S",data4[16][1] + data4[17][1]]);
      var s1 = 0;
      for( i = 1 ; i < 6 ; i++)
        s1 = s1 + data4[i][1];
      s1 = s1 + data4[14][1];
      s1 = s1 + data4[15][1];
      var s2 = 0;
      for( i = 6 ; i < 14 ; i++)
        s2 = s2 + data4[i][1];
      s2 = s2 + data4[16][1];
      s2 = s2 + data4[17][1];
      data5.push(['1a Parte',s1]);
      data5.push(['2a Parte',s2]);
      var s3 = data4[1][1] + data4[3][1] + data4[5][1] + data4[6][1] + data4[8][1] + data4[10][1] + data4[12][1] + data4[14][1] + data4[16][1];
      var s4 = data4[2][1] + data4[4][1] + data4[7][1] + data4[9][1] + data4[11][1] + data4[13][1] + data4[15][1] + data4[17][1];
      data6.push(['Teoria',s3]);
      data6.push(['Esercizi',s4]);
      res.render("PartecipazioneForm.ejs", {
        ggiorni: JSON.stringify(data1),
        gpsett: JSON.stringify(data2),
        gore: JSON.stringify(data3),
        gcapitoli: JSON.stringify(data4b),
        gparti: JSON.stringify(data5),
        gtipo: JSON.stringify(data6),
        s1: JSON.stringify(selected),
        s2: JSON.stringify(Filtro)
      });
    });
  }

  q1()
  .then(q3)
  .then(q4)
  .then(session.close());    

});

app.post('/PartecipazioneAndamentoQuiz', function(req, res) {

  var query1 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE r.evento = 'Inviato tentativo quiz' " +
  " OR q.contesto = 'S' " +
  " RETURN q.nome,r.mese,size(collect(r.mese)) " +
  " ORDER BY q.nome,r.mese "
  ;

  var data = [];
  var data1 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data2 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data3 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data4 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data5 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data6 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data7 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data8 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data9 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data10 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data11 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data12 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data13 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data14 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data15 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data16 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];
  var data17 = [['Mesi','Tentativi Inviati'],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0]];

  var session = driver.session();

  function q1() {
    return session
    .run(query1)
    .then(function (result) {
      result.records.forEach(function (record) {
        data.push([record.get("q.nome"),record.get("r.mese"),record.get("size(collect(r.mese))")]);
      });
      for( i = 0 ; i < data.length ; i++ ) {
        if( data[i][0] == "1T" ) data1[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "2T" ) data2[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "2T" ) data3[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "3E" ) data4[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "3T" ) data5[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "4T" ) data6[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "5E" ) data7[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "5T" ) data8[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "6E" ) data9[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "6T" ) data10[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "7E" ) data11[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "7T" ) data12[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "8E" ) data13[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "1PST" ) data14[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "1PSE" ) data15[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "2PST" ) data16[data[i][1]] = [data[i][1],data[i][2]];
        if( data[i][0] == "2PSE" ) data17[data[i][1]] = [data[i][1],data[i][2]];
      }
      res.render("PartecipazioneAndamentoQuiz.ejs", {
        q1: JSON.stringify(data1),
        q2: JSON.stringify(data2),
        q3: JSON.stringify(data3),
        q4: JSON.stringify(data4),
        q5: JSON.stringify(data5),
        q6: JSON.stringify(data6),
        q7: JSON.stringify(data7),
        q8: JSON.stringify(data8),
        q9: JSON.stringify(data9),
        q10: JSON.stringify(data10),
        q11: JSON.stringify(data11),
        q12: JSON.stringify(data12),
        q13: JSON.stringify(data13),
        q14: JSON.stringify(data14),
        q15: JSON.stringify(data15),
        q16: JSON.stringify(data16),
        q17: JSON.stringify(data17),
      });
    });
  }

  q1()
  .then(session.close());

});

app.get('/Completamento', function(req, res) {

  var query1 = " MATCH (s:Studente) RETURN count(s) ";
  
  var query2 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE r.evento = 'Inviato tentativo quiz' " +
  " OR q.contesto = 'S' " +
  " RETURN q.nome, size(collect(distinct s.matricola)) "
  ;

  var data1 = [];

  var data2 = [['Quiz','Numero Studenti']];
  var data3 = [['Quiz','Percentuale Studenti']];

  var session = driver.session();

  function q1() {
    return session
    .run(query1)
    .then(function (result) {
      result.records.forEach(function (record) {
        data1.push(record.get("count(s)"));
      });
    });
  }
  function q2() {
    return session
    .run(query2)
    .then(function (result) {
      result.records.forEach(function (record) {
        data2.push([record.get("q.nome"),record.get("size(collect(distinct s.matricola))")]);
      });
      for ( i = 1 ; i < data2.length ; i++ )
        data3.push([data2[i][0],data2[i][1]/data1[0]]);
      res.render("Completamento.ejs", {
        nStudenti: JSON.stringify(data1.length),
        completamenton: JSON.stringify(data2),
        completamentop: JSON.stringify(data3)
      });  
    });
  }

  q1()
  .then(q2)
  .then(session.close());

});

app.get('/EsamiEVoti', function(req, res) {

  var query0 = " MATCH (s:Studente) RETURN count(s) ";

  var query1 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE q.contesto = 'P' OR q.contesto = 'A' " +
    " RETURN q.nome, size(collect(s.matricola)), avg(r.voto)"
  ;

  var query1a = " MATCH (s:Studente)-[r]->(q:Quiz) " +
    " WHERE q.contesto = 'S' " +
    " RETURN q.nome, size(collect(s.matricola)), avg(r.voto)"
  ;

  var query2 = "MATCH (s:Studente)-[r1]->(q1:Quiz) , (s:Studente)-[r2]->(q2:Quiz) " +
    " WHERE q1.nome = '1PT' AND q2.nome = '1PE' AND r1.voto >= 6 AND r2.voto >= 10 " +
    " RETURN  count(s) "
  ;

  var query3 = "MATCH (s:Studente)-[r1]->(q1:Quiz) , (s:Studente)-[r2]->(q2:Quiz) " +
    " WHERE q1.nome = '2PT' AND q2.nome = '2PE' AND r1.voto >= 6 AND r2.voto >= 10 " +
    " RETURN  count(s) "
  ;

  var query4 = "MATCH (s:Studente)-[r1]->(q1:Quiz) , (s:Studente)-[r2]->(q2:Quiz) " +
    " WHERE q1.nome = '1AT' AND q2.nome = '1AE' AND r1.voto >= 6 AND r2.voto >= 10 " +
    " RETURN  count(s) "
  ;

  var query5 = "MATCH (s:Studente)-[r1]->(q1:Quiz) , (s:Studente)-[r2]->(q2:Quiz) " +
    " WHERE q1.nome = '2AT' AND q2.nome = '2AE' AND r1.voto >= 6 AND r2.voto >= 10 " + 
    " RETURN  count(s) "
  ;

  var data0 = [];
  var dataa = [];
  var dataaa = [];
  var datab = [];
  var datac = [];
  var datad = [];
  var datae = [];
  var data1 = [['Esami','Numero Studenti']];
  var data2 = [['Esami','Percentuale Studenti']];
  var data3 = [['EsamiT','Media Voti']];
  var data3a = [['SimT','Media Voti']];
  var data4 = [['EsamiE','Media Voti']];
  var data4a = [['SimE','Media Voti']];
  var data5 = [['Tipo','Numero']];
  var data6 = [['Tipo','Numero']];
  var data7 = [['Tipo','Numero']];
  var data8 = [['Tipo','Numero']];

  var session = driver.session();

  function q0() {
    return session
    .run(query0)
    .then(function (result) {
      result.records.forEach(function (record) {
        data0.push(record.get("count(s)"));
      });
    });
  }
  function q1() {
    return session
    .run(query1)
    .then(function (result) {
      result.records.forEach(function (record) {
        dataa.push([record.get("q.nome"),record.get("size(collect(s.matricola))"),record.get("avg(r.voto)")]);
      });
      for ( i = 0 ; i < dataa.length ; i++ ) {
        data1.push([dataa[i][0],dataa[i][1]])
        data2.push([dataa[i][0],dataa[i][1]/data0[0]]);
        if ( i % 2 == 0 ) data3.push([dataa[i][0],dataa[i][2]]);
        else data4.push([dataa[i][0],dataa[i][2]]);
      }
    });
  }
  function q1a() {
    return session
    .run(query1a)
    .then(function (result) {
      result.records.forEach(function (record) {
        dataaa.push([record.get("q.nome"),record.get("size(collect(s.matricola))"),record.get("avg(r.voto)")]);
      });
      for ( i = 0 ; i < dataaa.length ; i++ ) {
        if ( i % 2 == 0 ) data3a.push([dataaa[i][0],dataaa[i][2]]);
        else data4a.push([dataaa[i][0],dataaa[i][2]]);
      }
    });
  }
  function q2() {
    return session
    .run(query2)
    .then(function (result) {
      result.records.forEach(function (record) {
        datab.push(record.get("count(s)"))
      });
      data5.push(['Promossi',datab[0]]);
      data5.push(['Bocciati',data1[1][1] - datab[0]]);
    });
  }
  function q3() {
    return session
    .run(query3)
    .then(function (result) {
      result.records.forEach(function (record) {
        datac.push(record.get("count(s)"))
      });
      data6.push(['Promossi',datac[0]]);
      data6.push(['Bocciati',data1[3][1] - datac[0]]);
    });
  }
  function q4() {
    return session
    .run(query4)
    .then(function (result) {
      result.records.forEach(function (record) {
        datad.push(record.get("count(s)"))
      });
      data7.push(['Promossi',datad[0]]);
      data7.push(['Bocciati',data1[5][1] - datad[0]]);
    });
  }
  function q5() {
    return session
    .run(query5)
    .then(function (result) {
      result.records.forEach(function (record) {
        datae.push(record.get("count(s)"))
      });
      data8.push(['Promossi',datae[0]]);
      data8.push(['Bocciati',data1[7][1] - datae[0]]);
      res.render("EsamiEVoti.ejs", {
        g1: JSON.stringify(data1),
        g2: JSON.stringify(data2),
        g3: JSON.stringify(data3),
        g3a: JSON.stringify(data3a),
        g4: JSON.stringify(data4),
        g4a: JSON.stringify(data4a),
        g5: JSON.stringify(data5),
        g6: JSON.stringify(data6),
        g7: JSON.stringify(data7),
        g8: JSON.stringify(data8)
      });
    });
  }

  q0()
  .then(q1)
  .then(q1a)
  .then(q2)
  .then(q3)
  .then(q4)
  .then(q5)
  .then(session.close());

});

app.get('/DivisioneInGruppi', function(req, res) {
 
  var query0 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE r.evento = 'Inviato tentativo quiz' " +
  " OR q.contesto = 'S' " +
  " RETURN count(distinct q.nome) "
  ;

  var query00 = " MATCH (s:Studente) " +
  " RETURN count(s) "
  ;

  var query1 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE r.evento = 'Inviato tentativo quiz' " +
  " OR q.contesto = 'S' " +
  " RETURN s.matricola, size(collect(distinct q.nome)) "
  ;

  var query2 = " UNWIND $List AS L " +
  " MATCH (s:Studente {matricola: L}) " +
  " SET s.Completamento = 'Basso' "
  ;

  var query2a = " MATCH (s:Studente {Completamento: 'Basso'}) " +
  " RETURN count(s)"
  ;

  var query3 = " UNWIND $List AS L " +
  " MATCH (s:Studente {matricola: L}) " +
  " SET s.Completamento = 'Medio Basso' "
  ;

  var query3a = " MATCH (s:Studente {Completamento: 'Medio Basso'}) " +
  " RETURN count(s)"
  ;

  var query4 = " UNWIND $List AS L " +
  " MATCH (s:Studente {matricola: L}) " +
  " SET s.Completamento = 'Medio Alto' "
  ;

  var query4a = " MATCH (s:Studente {Completamento: 'Medio Alto'}) " +
  " RETURN count(s)"
  ;

  var query5 = " UNWIND $List AS L " +
  " MATCH (s:Studente {matricola: L}) " +
  " SET s.Completamento = 'Alto' "
  ;

  var query5a = " MATCH (s:Studente {Completamento: 'Alto'}) " +
  " RETURN count(s)"
  ;

  var query6 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE s.Completamento = 'Basso' AND ( q.contesto = 'P' OR q.contesto = 'A' ) " +
  " RETURN q.nome, size(collect(s.matricola)), avg(r.voto) " +
  " ORDER BY q.nome "
  ;

  var query7 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE s.Completamento = 'Medio Basso' AND ( q.contesto = 'P' OR q.contesto = 'A' ) " +
  " RETURN q.nome, size(collect(s.matricola)), avg(r.voto)" +
  " ORDER BY q.nome "
  ;

  var query8 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE s.Completamento = 'Medio Alto' AND ( q.contesto = 'P' OR q.contesto = 'A' ) " +
  " RETURN q.nome, size(collect(s.matricola)), avg(r.voto)" +
  " ORDER BY q.nome "
  ;

  var query9 = " MATCH (s:Studente)-[r]->(q:Quiz) " +
  " WHERE s.Completamento = 'Alto' AND ( q.contesto = 'P' OR q.contesto = 'A' ) " +
  " RETURN q.nome, size(collect(s.matricola)), avg(r.voto)" +
  " ORDER BY q.nome "
  ;

  var data0 = [];
  var data00 = [];
  var data1 = [];
  var data2 = [];
  var data3 = [];
  var data4 = [];
  var data5 = [];
  var data6 = [];
  var data7 = [];
  var data8 = [['EsamiT','Media Voti']];
  var data9 = [['EsamiE','Media Voti']];
  var data10 = [];
  var data11 = [['EsamiT','Media Voti']];
  var data12 = [['EsamiE','Media Voti']];
  var data13 = [];
  var data14 = [['EsamiT','Media Voti']];
  var data15 = [['EsamiE','Media Voti']];
  var data16 = [];
  var data17 = [['EsamiT','Media Voti']];
  var data18 = [['EsamiE','Media Voti']];

  var data19 = [];
  var data20 = [];
  var data21 = [];
  var data22 = [];

  var session = driver.session();

  function q0() {
    return session
    .run(query0)
    .then(function (result) {
      result.records.forEach(function (record) {
        data0.push([record.get("count(distinct q.nome)")]);
      });
    });
  }
  function q00() {
    return session
    .run(query00)
    .then(function (result) {
      result.records.forEach(function (record) {
        data00.push([record.get("count(s)")]);
      });
    });
  }
  function q1() {
    return session
    .run(query1)
    .then(function (result) {
      result.records.forEach(function (record) {
        data1.push([record.get("s.matricola"),record.get("size(collect(distinct q.nome))")]);
      });
      for ( i = 0 ; i < data1.length ; i++ )
        data2.push([data1[i][0],Math.round(data1[i][1]/data0[0]*100)]);
      for ( i = 0 ; i < data2.length ; i++ ) {
        if ( data2[i][1] <= 25 ) data3.push(data2[i][0]);
        else if ( data2[i][1] <= 50 ) data4.push(data2[i][0]);
        else if ( data2[i][1] <= 75 ) data5.push(data2[i][0]);
        else data6.push(data2[i][0]);
      }
    });
  }
  function q2() {
    return session
    .run(query2,{List: data3 })
    .then(function (result) {
    });
  }
  function q3() {
    return session
    .run(query3,{List: data4 })
    .then(function (result) {
    });
  }
  function q4() {
    return session
    .run(query4,{List: data5 })
    .then(function (result) {
    });
  }
  function q5() {
    return session
    .run(query5,{List: data6 })
    .then(function (result) {
    });
  }
  function q6() {
    return session
    .run(query6)
    .then(function (result) {
      result.records.forEach(function (record) {
        data7.push([record.get("q.nome"),record.get("size(collect(s.matricola))"),record.get("avg(r.voto)")]);
      });
      data8.push([data7[3][0],data7[3][2]]);
      data8.push([data7[7][0],data7[7][2]]);
      data8.push([data7[1][0],data7[1][2]]);
      data8.push([data7[5][0],data7[5][2]]);
      data9.push([data7[2][0],data7[2][2]]);
      data9.push([data7[6][0],data7[6][2]]);
      data9.push([data7[0][0],data7[0][2]]);
      data9.push([data7[4][0],data7[4][2]]);
    });
  }
  function q7() {
    return session
    .run(query7)
    .then(function (result) {
      result.records.forEach(function (record) {
        data10.push([record.get("q.nome"),record.get("size(collect(s.matricola))"),record.get("avg(r.voto)")]);
      });
      data11.push([data10[3][0],data10[3][2]]);
      data11.push([data10[7][0],data10[7][2]]);
      data11.push([data10[1][0],data10[1][2]]);
      data11.push([data10[5][0],data10[5][2]]);
      data12.push([data10[2][0],data10[2][2]]);
      data12.push([data10[6][0],data10[6][2]]);
      data12.push([data10[0][0],data10[0][2]]);
      data12.push([data10[4][0],data10[4][2]]);
    });
  }
  function q8() {
    return session
    .run(query8)
    .then(function (result) {
      result.records.forEach(function (record) {
        data13.push([record.get("q.nome"),record.get("size(collect(s.matricola))"),record.get("avg(r.voto)")]);
      });
      data14.push([data13[3][0],data13[3][2]]);
      data14.push([data13[7][0],data13[7][2]]);
      data14.push([data13[1][0],data13[1][2]]);
      data14.push([data13[5][0],data13[5][2]]);
      data15.push([data13[2][0],data13[2][2]]);
      data15.push([data13[6][0],data13[6][2]]);
      data15.push([data13[0][0],data13[0][2]]);
      data15.push([data13[4][0],data13[4][2]]);
    });
  }
  function q9() {
    return session
    .run(query9)
    .then(function (result) {
      result.records.forEach(function (record) {
        data16.push([record.get("q.nome"),record.get("size(collect(s.matricola))"),record.get("avg(r.voto)")]);
      });
      data17.push([data16[3][0],data16[3][2]]);
      data17.push([data16[7][0],data16[7][2]]);
      data17.push([data16[1][0],data16[1][2]]);
      data17.push([data16[5][0],data16[5][2]]);
      data18.push([data16[2][0],data16[2][2]]);
      data18.push([data16[6][0],data16[6][2]]);
      data18.push([data16[0][0],data16[0][2]]);
      data18.push([data16[4][0],data16[4][2]]);
    });
  }
  function q10() {
    return session
    .run(query2a)
    .then(function (result) {
      result.records.forEach(function (record) {
        data19.push([record.get("count(s)")]);
      });
    });
  }
  function q11() {
    return session
    .run(query3a)
    .then(function (result) {
      result.records.forEach(function (record) {
        data20.push([record.get("count(s)")]);
      });
    });
  }
  function q12() {
    return session
    .run(query4a)
    .then(function (result) {
      result.records.forEach(function (record) {
        data21.push([record.get("count(s)")]);
      });
    });
  }
  function q13() {
    return session
    .run(query5a)
    .then(function (result) {
      result.records.forEach(function (record) {
        data22.push([record.get("count(s)")]);
      });
      res.render("DivisioneInGruppi.ejs", {
        g1ns: data19[0],
        g1ps: Math.round(data19[0] / data00[0] * 100),
        g1vt: JSON.stringify(data8),
        g1ve: JSON.stringify(data9),
        g2ns: data20[0],
        g2ps: Math.round(data20[0] / data00[0] * 100),
        g2vt: JSON.stringify(data11),
        g2ve: JSON.stringify(data12),
        g3ns: data21[0],
        g3ps: Math.floor(data21[0] / data00[0] * 100),
        g3vt: JSON.stringify(data14),
        g3ve: JSON.stringify(data15),
        g4ns: data22[0],
        g4ps: Math.round(data22[0] / data00[0] * 100),
        g4vt: JSON.stringify(data17),
        g4ve: JSON.stringify(data18),    
      });
    });
  }

  q0()
  .then(q00)
  .then(q1)
  .then(q2)
  .then(q3)
  .then(q4)
  .then(q5)
  .then(q6)
  .then(q7)
  .then(q8)
  .then(q9)
  .then(q10)
  .then(q11)
  .then(q12)
  .then(q13)
  .then(session.close());

});

app.listen(port, () => console.log(`App listening on port ${port}!`))


driver.close();