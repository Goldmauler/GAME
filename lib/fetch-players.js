// Fetch real IPL players from Cricket API
const https = require('https');

const API_KEY = '3a9d8ee5-d5fc-49a6-820e-f1b2422952a3';
const API_BASE_URL = 'https://api.cricapi.com/v1';

// IPL 2024 Squad - Real Players
const IPL_PLAYERS = [
  // Mumbai Indians
  { name: "Rohit Sharma", role: "Batsman", team: "Mumbai Indians", basePrice: 15 },
  { name: "Jasprit Bumrah", role: "Bowler", team: "Mumbai Indians", basePrice: 12 },
  { name: "Suryakumar Yadav", role: "Batsman", team: "Mumbai Indians", basePrice: 10 },
  { name: "Ishan Kishan", role: "Wicket-keeper", team: "Mumbai Indians", basePrice: 9 },
  { name: "Tilak Varma", role: "Batsman", team: "Mumbai Indians", basePrice: 6 },
  { name: "Hardik Pandya", role: "All-rounder", team: "Mumbai Indians", basePrice: 14 },
  { name: "Tim David", role: "All-rounder", team: "Mumbai Indians", basePrice: 8 },
  { name: "Cameron Green", role: "All-rounder", team: "Mumbai Indians", basePrice: 10 },
  { name: "Piyush Chawla", role: "Bowler", team: "Mumbai Indians", basePrice: 4 },
  { name: "Gerald Coetzee", role: "Bowler", team: "Mumbai Indians", basePrice: 5 },
  
  // Chennai Super Kings
  { name: "MS Dhoni", role: "Wicket-keeper", team: "Chennai Super Kings", basePrice: 12 },
  { name: "Ravindra Jadeja", role: "All-rounder", team: "Chennai Super Kings", basePrice: 13 },
  { name: "Ruturaj Gaikwad", role: "Batsman", team: "Chennai Super Kings", basePrice: 9 },
  { name: "Devon Conway", role: "Batsman", team: "Chennai Super Kings", basePrice: 7 },
  { name: "Shivam Dube", role: "All-rounder", team: "Chennai Super Kings", basePrice: 6 },
  { name: "Deepak Chahar", role: "Bowler", team: "Chennai Super Kings", basePrice: 8 },
  { name: "Tushar Deshpande", role: "Bowler", team: "Chennai Super Kings", basePrice: 4 },
  { name: "Maheesh Theekshana", role: "Bowler", team: "Chennai Super Kings", basePrice: 6 },
  { name: "Matheesha Pathirana", role: "Bowler", team: "Chennai Super Kings", basePrice: 7 },
  { name: "Ajinkya Rahane", role: "Batsman", team: "Chennai Super Kings", basePrice: 5 },
  
  // Royal Challengers Bangalore
  { name: "Virat Kohli", role: "Batsman", team: "Bangalore Royals", basePrice: 15 },
  { name: "Faf du Plessis", role: "Batsman", team: "Bangalore Royals", basePrice: 8 },
  { name: "Glenn Maxwell", role: "All-rounder", team: "Bangalore Royals", basePrice: 11 },
  { name: "Mohammed Siraj", role: "Bowler", team: "Bangalore Royals", basePrice: 9 },
  { name: "Wanindu Hasaranga", role: "All-rounder", team: "Bangalore Royals", basePrice: 8 },
  { name: "Dinesh Karthik", role: "Wicket-keeper", team: "Bangalore Royals", basePrice: 6 },
  { name: "Harshal Patel", role: "Bowler", team: "Bangalore Royals", basePrice: 7 },
  { name: "Josh Hazlewood", role: "Bowler", team: "Bangalore Royals", basePrice: 8 },
  { name: "Anuj Rawat", role: "Wicket-keeper", team: "Bangalore Royals", basePrice: 3 },
  { name: "Rajat Patidar", role: "Batsman", team: "Bangalore Royals", basePrice: 5 },
  
  // Kolkata Knight Riders
  { name: "Shreyas Iyer", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 10 },
  { name: "Andre Russell", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 11 },
  { name: "Sunil Narine", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 9 },
  { name: "Varun Chakravarthy", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 7 },
  { name: "Venkatesh Iyer", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 8 },
  { name: "Rinku Singh", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 6 },
  { name: "Nitish Rana", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 7 },
  { name: "Rahmanullah Gurbaz", role: "Wicket-keeper", team: "Kolkata Knight Riders", basePrice: 5 },
  { name: "Mitchell Starc", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 12 },
  { name: "Phil Salt", role: "Wicket-keeper", team: "Kolkata Knight Riders", basePrice: 6 },
  
  // Delhi Capitals
  { name: "Rishabh Pant", role: "Wicket-keeper", team: "Delhi Capitals", basePrice: 14 },
  { name: "David Warner", role: "Batsman", team: "Delhi Capitals", basePrice: 10 },
  { name: "Axar Patel", role: "All-rounder", team: "Delhi Capitals", basePrice: 9 },
  { name: "Kuldeep Yadav", role: "Bowler", team: "Delhi Capitals", basePrice: 8 },
  { name: "Anrich Nortje", role: "Bowler", team: "Delhi Capitals", basePrice: 9 },
  { name: "Mitchell Marsh", role: "All-rounder", team: "Delhi Capitals", basePrice: 10 },
  { name: "Prithvi Shaw", role: "Batsman", team: "Delhi Capitals", basePrice: 5 },
  { name: "Khaleel Ahmed", role: "Bowler", team: "Delhi Capitals", basePrice: 4 },
  { name: "Mukesh Kumar", role: "Bowler", team: "Delhi Capitals", basePrice: 5 },
  { name: "Tristan Stubbs", role: "Batsman", team: "Delhi Capitals", basePrice: 6 },
  
  // Rajasthan Royals
  { name: "Sanju Samson", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 11 },
  { name: "Jos Buttler", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 12 },
  { name: "Yashasvi Jaiswal", role: "Batsman", team: "Rajasthan Royals", basePrice: 8 },
  { name: "Yuzvendra Chahal", role: "Bowler", team: "Rajasthan Royals", basePrice: 9 },
  { name: "Trent Boult", role: "Bowler", team: "Rajasthan Royals", basePrice: 10 },
  { name: "Shimron Hetmyer", role: "Batsman", team: "Rajasthan Royals", basePrice: 7 },
  { name: "Ravichandran Ashwin", role: "All-rounder", team: "Rajasthan Royals", basePrice: 8 },
  { name: "Dhruv Jurel", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 4 },
  { name: "Prasidh Krishna", role: "Bowler", team: "Rajasthan Royals", basePrice: 6 },
  { name: "Riyan Parag", role: "All-rounder", team: "Rajasthan Royals", basePrice: 5 },
  
  // Punjab Kings
  { name: "Shikhar Dhawan", role: "Batsman", team: "Punjab Kings", basePrice: 8 },
  { name: "Liam Livingstone", role: "All-rounder", team: "Punjab Kings", basePrice: 10 },
  { name: "Kagiso Rabada", role: "Bowler", team: "Punjab Kings", basePrice: 11 },
  { name: "Arshdeep Singh", role: "Bowler", team: "Punjab Kings", basePrice: 8 },
  { name: "Jitesh Sharma", role: "Wicket-keeper", team: "Punjab Kings", basePrice: 5 },
  { name: "Sam Curran", role: "All-rounder", team: "Punjab Kings", basePrice: 12 },
  { name: "Rahul Chahar", role: "Bowler", team: "Punjab Kings", basePrice: 5 },
  { name: "Harpreet Brar", role: "All-rounder", team: "Punjab Kings", basePrice: 4 },
  { name: "Atharva Taide", role: "Batsman", team: "Punjab Kings", basePrice: 3 },
  { name: "Nathan Ellis", role: "Bowler", team: "Punjab Kings", basePrice: 6 },
  
  // Sunrisers Hyderabad
  { name: "Aiden Markram", role: "Batsman", team: "Sunrisers Hyderabad", basePrice: 9 },
  { name: "Travis Head", role: "Batsman", team: "Sunrisers Hyderabad", basePrice: 10 },
  { name: "Heinrich Klaasen", role: "Wicket-keeper", team: "Sunrisers Hyderabad", basePrice: 11 },
  { name: "Abhishek Sharma", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 6 },
  { name: "Bhuvneshwar Kumar", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 8 },
  { name: "T Natarajan", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 7 },
  { name: "Umran Malik", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 6 },
  { name: "Washington Sundar", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 7 },
  { name: "Marco Jansen", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 8 },
  { name: "Abdul Samad", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 4 },
  
  // Lucknow Super Giants
  { name: "KL Rahul", role: "Wicket-keeper", team: "Lucknow Super Giants", basePrice: 13 },
  { name: "Marcus Stoinis", role: "All-rounder", team: "Lucknow Super Giants", basePrice: 9 },
  { name: "Nicholas Pooran", role: "Wicket-keeper", team: "Lucknow Super Giants", basePrice: 10 },
  { name: "Quinton de Kock", role: "Wicket-keeper", team: "Lucknow Super Giants", basePrice: 9 },
  { name: "Krunal Pandya", role: "All-rounder", team: "Lucknow Super Giants", basePrice: 7 },
  { name: "Ravi Bishnoi", role: "Bowler", team: "Lucknow Super Giants", basePrice: 6 },
  { name: "Mohsin Khan", role: "Bowler", team: "Lucknow Super Giants", basePrice: 5 },
  { name: "Ayush Badoni", role: "Batsman", team: "Lucknow Super Giants", basePrice: 4 },
  { name: "Mark Wood", role: "Bowler", team: "Lucknow Super Giants", basePrice: 8 },
  { name: "Kyle Mayers", role: "All-rounder", team: "Lucknow Super Giants", basePrice: 7 },
  
  // Gujarat Titans (Hyderabad Chargers)
  { name: "Shubman Gill", role: "Batsman", team: "Hyderabad Chargers", basePrice: 11 },
  { name: "Rashid Khan", role: "All-rounder", team: "Hyderabad Chargers", basePrice: 12 },
  { name: "Mohammed Shami", role: "Bowler", team: "Hyderabad Chargers", basePrice: 10 },
  { name: "David Miller", role: "Batsman", team: "Hyderabad Chargers", basePrice: 9 },
  { name: "Sai Sudharsan", role: "Batsman", team: "Hyderabad Chargers", basePrice: 5 },
  { name: "Wriddhiman Saha", role: "Wicket-keeper", team: "Hyderabad Chargers", basePrice: 6 },
  { name: "Rahul Tewatia", role: "All-rounder", team: "Hyderabad Chargers", basePrice: 7 },
  { name: "Darshan Nalkande", role: "All-rounder", team: "Hyderabad Chargers", basePrice: 3 },
  { name: "Mohit Sharma", role: "Bowler", team: "Hyderabad Chargers", basePrice: 5 },
  { name: "Joshua Little", role: "Bowler", team: "Hyderabad Chargers", basePrice: 6 },
  
  // Additional emerging players
  { name: "Mayank Yadav", role: "Bowler", team: "Lucknow Super Giants", basePrice: 3 },
  { name: "Shahrukh Khan", role: "Batsman", team: "Punjab Kings", basePrice: 4 },
  { name: "Prabhsimran Singh", role: "Wicket-keeper", team: "Punjab Kings", basePrice: 3 },
  { name: "Yash Dhull", role: "Batsman", team: "Delhi Capitals", basePrice: 3 },
  { name: "Kumar Kushagra", role: "Wicket-keeper", team: "Delhi Capitals", basePrice: 2 },
  { name: "Manish Pandey", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 5 },
  { name: "Suyash Sharma", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 2 },
  { name: "Akash Deep", role: "Bowler", team: "Bangalore Royals", basePrice: 3 },
  { name: "Sandeep Warrier", role: "Bowler", team: "Rajasthan Royals", basePrice: 2 },
  { name: "Kunal Singh Rathore", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 1 },
];

// Shuffle and create player pool
function createPlayers() {
  // Shuffle players for random auction order
  const shuffled = [...IPL_PLAYERS].sort(() => Math.random() - 0.5);
  
  return shuffled.map((player, i) => ({
    id: `player-${i}`,
    name: player.name,
    role: player.role,
    basePrice: Math.min(player.basePrice, 2), // Cap at 2Cr for realistic auction rates
    previousTeam: player.team, // For reference
  }));
}

// Optional: Fetch additional player info from API (if needed)
async function fetchPlayerInfo(playerName) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/players_info?apikey=${API_KEY}&name=${encodeURIComponent(playerName)}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
  createPlayers,
  fetchPlayerInfo,
  IPL_PLAYERS
};
