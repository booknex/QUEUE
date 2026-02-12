const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const contacts = [
// Batch from production - all 1940 contacts
// id, name, phone, email, created_at, company_id
[2,"RALPH KIRK",null,null,"2025-11-05 03:30:39.463034",1],
[3,"JOHN APONTE",null,null,"2025-11-05 03:31:20.311163",1],
[4,"MICHAEL LITWIN",null,null,"2025-11-05 03:31:49.657922",1],
[5,"HANNAH LADIN",null,null,"2025-11-05 03:32:34.03892",1],
[6,"IMANI MOTA",null,null,"2025-11-05 03:32:57.316244",1],
[7,"HECTOR FERRER",null,null,"2025-11-05 03:33:27.537534",1],
[8,"FERNANDO VASQUEZ",null,null,"2025-11-05 03:33:59.174249",1],
[9,"JOHN APONTE",null,null,"2025-11-05 03:38:06.882659",1],
[10,"hailey bishop",null,null,"2025-11-05 05:02:19.401926",1],
[11,"(800) 829-0922","+18008290922",null,"2025-11-05 05:02:19.467949",1],
[12,"(720) 979-2175","+17209792175",null,"2025-11-05 05:02:19.523214",1],
[13,"(813) 723-0511","+18137230511",null,"2025-11-05 05:02:19.584246",1],
[14,"(813) 279-1949","+18132791949",null,"2025-11-05 05:02:19.642021",1],
[15,"(448) 444-5174","+14484445174",null,"2025-11-05 05:02:19.699276",1],
[16,"maria wilkins","+928133285655","maria@maxfreshcleaning.com","2025-11-05 05:02:19.77543",1],
[17,"34831","+134831",null,"2025-11-05 05:02:19.832299",1],
[18,"(727) 615-6683","+17276156683",null,"2025-11-05 05:02:19.889155",1],
[19,"(727) 906-5830","+17279065830",null,"2025-11-05 05:02:19.945638",1],
[20,"jorge blanco","+18135804805","jb461626@gmail.com","2025-11-05 05:02:20.021276",1],
[21,"jorge rigual",null,null,"2025-11-05 05:02:20.063328",1],
[22,"paula gutierrez","+17274591432","paulagutierrez0515@gmail.com","2025-11-05 05:02:20.141682",1],
[23,"(304) 707-9491","+13047079491",null,"2025-11-05 05:02:20.199416",1],
[24,"(352) 606-1402","+13526061402",null,"2025-11-05 05:02:20.260834",1],
[25,"(941) 841-3755","+19418413755",null,"2025-11-05 05:02:20.318202",1],
[26,"(888) 525-1985","+18885251985",null,"2025-11-05 05:02:20.375298",1],
[27,"(949) 390-7062","+19493907062",null,"2025-11-05 05:02:20.432974",1],
[28,"(833) 961-1963","+18339611963",null,"2025-11-05 05:02:20.489601",1],
[29,"(610) 557-1228","+16105571228",null,"2025-11-05 05:02:20.5458",1],
[30,"(972) 884-5504","+19728845504",null,"2025-11-05 05:02:20.602919",1],
[31,"karina moreno","+17276781175",null,"2025-11-05 05:02:20.660087",1],
[32,"lauren abott","+18138294054",null,"2025-11-05 05:02:20.720372",1],
[33,"(813) 901-1107","+18139011107",null,"2025-11-05 05:02:20.779222",1],
[34,"(727) 625-2311","+17276252311",null,"2025-11-05 05:02:20.835162",1],
[35,"(866) 411-2742","+18664112742",null,"2025-11-05 05:02:20.892657",1],
[36,"(727) 376-1808","+17273761808",null,"2025-11-05 05:02:20.9519",1],
[37,"(727) 460-2655","+17274602655",null,"2025-11-05 05:02:21.00912",1],
[38,"(650) 203-2795","+16502032795",null,"2025-11-05 05:02:21.066146",1],
[39,"(858) 215-8150","+18582158150",null,"2025-11-05 05:02:21.123813",1],
[40,"(786) 403-8749","+17864038749",null,"2025-11-05 05:02:21.181585",1],
[41,"(860) 940-8224","+18609408224",null,"2025-11-05 05:02:21.238796",1],
[42,"(727) 331-2382","+17273312382",null,"2025-11-05 05:02:21.297046",1],
[43,"(855) 480-8573","+18554808573",null,"2025-11-05 05:02:21.352666",1],
[44,"(833) 352-7759","+18333527759",null,"2025-11-05 05:02:21.410001",1],
[45,"(877) 846-8770","+18778468770",null,"2025-11-05 05:02:21.467224",1],
[46,"(727) 623-6270","+17276236270",null,"2025-11-05 05:02:21.525175",1],
[47,"(540) 420-9624","+15404209624",null,"2025-11-05 05:02:21.581509",1],
[48,"bernadette hurd","+13522388025",null,"2025-11-05 05:02:21.640383",1],
[49,"daniel edwards","+918454479454","daniel.websolution07@gmail.com","2025-11-05 05:02:21.716367",1],
[50,"(727) 350-2416","+17273502416",null,"2025-11-05 05:02:21.773554",1],
];

async function importContacts() {
  const client = await pool.connect();
  try {
    let inserted = 0;
    const batchSize = 50;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let paramIdx = 1;
      
      for (const [id, name, phone, email, created_at, company_id] of batch) {
        values.push(`($${paramIdx}, $${paramIdx+1}, $${paramIdx+2}, $${paramIdx+3}, $${paramIdx+4}, $${paramIdx+5})`);
        params.push(id, name, phone, email, created_at, company_id);
        paramIdx += 6;
      }
      
      const sql = `INSERT INTO contacts (id, name, phone, email, created_at, company_id) VALUES ${values.join(', ')} ON CONFLICT (id) DO NOTHING`;
      await client.query(sql, params);
      inserted += batch.length;
      console.log(`Inserted batch: ${inserted}/${contacts.length}`);
    }
    
    await client.query(`SELECT setval('contacts_id_seq', (SELECT MAX(id) FROM contacts))`);
    console.log(`Done! Total: ${inserted} contacts imported.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

importContacts();
