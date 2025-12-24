// Fetch real IPL players from Cricket API
const https = require('https');

const API_KEY = '3a9d8ee5-d5fc-49a6-820e-f1b2422952a3';
const API_BASE_URL = 'https://api.cricapi.com/v1';

// IPL 2025 MEGA AUCTION - Real Players with Actual Base Prices and Sold Prices (in Crores)
// Base prices are official IPL auction base prices, auctionPrice is what they were sold for
const IPL_PLAYERS = [
  // ============ MARQUEE PLAYERS (Top Buys) ============
  // Marquee players have base price of ₹2 Cr in IPL auction
  { name: "Rishabh Pant", role: "Wicket-keeper", team: "Lucknow Super Giants", basePrice: 2, auctionPrice: 27, isMarquee: true },
  { name: "Shreyas Iyer", role: "Batsman", team: "Punjab Kings", basePrice: 2, auctionPrice: 26.75, isMarquee: true },
  { name: "Venkatesh Iyer", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 2, auctionPrice: 23.75, isMarquee: true },
  { name: "Arshdeep Singh", role: "Bowler", team: "Punjab Kings", basePrice: 2, auctionPrice: 18, isMarquee: true },
  { name: "Yuzvendra Chahal", role: "Bowler", team: "Punjab Kings", basePrice: 2, auctionPrice: 18, isMarquee: true },
  { name: "Jos Buttler", role: "Wicket-keeper", team: "Gujarat Titans", basePrice: 2, auctionPrice: 15.75, isMarquee: true },
  { name: "Mohammed Shami", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 2, auctionPrice: 10, isMarquee: true },
  { name: "KL Rahul", role: "Wicket-keeper", team: "Delhi Capitals", basePrice: 2, auctionPrice: 14, isMarquee: true },
  { name: "Mitchell Starc", role: "Bowler", team: "Delhi Capitals", basePrice: 2, auctionPrice: 11.75, isMarquee: true },
  { name: "Kagiso Rabada", role: "Bowler", team: "Gujarat Titans", basePrice: 2, auctionPrice: 10.75, isMarquee: true },

  // ============ RETAINED PLAYERS ============
  // Mumbai Indians - Retained
  { name: "Jasprit Bumrah", role: "Bowler", team: "Mumbai Indians", basePrice: 2, auctionPrice: 18, isRetained: true },
  { name: "Suryakumar Yadav", role: "Batsman", team: "Mumbai Indians", basePrice: 2, auctionPrice: 16.35, isRetained: true },
  { name: "Hardik Pandya", role: "All-rounder", team: "Mumbai Indians", basePrice: 2, auctionPrice: 16.35, isRetained: true },
  { name: "Rohit Sharma", role: "Batsman", team: "Mumbai Indians", basePrice: 2, auctionPrice: 16.30, isRetained: true },
  { name: "Tilak Varma", role: "Batsman", team: "Mumbai Indians", basePrice: 0.75, auctionPrice: 8, isRetained: true },

  // Chennai Super Kings - Retained
  { name: "MS Dhoni", role: "Wicket-keeper", team: "Chennai Super Kings", basePrice: 0.4, auctionPrice: 4, isRetained: true, isUncapped: true },
  { name: "Ruturaj Gaikwad", role: "Batsman", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 18, isRetained: true },
  { name: "Matheesha Pathirana", role: "Bowler", team: "Chennai Super Kings", basePrice: 1, auctionPrice: 13, isRetained: true },
  { name: "Shivam Dube", role: "All-rounder", team: "Chennai Super Kings", basePrice: 1, auctionPrice: 12, isRetained: true },
  { name: "Ravindra Jadeja", role: "All-rounder", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 18, isRetained: true },

  // Royal Challengers Bengaluru - Retained
  { name: "Virat Kohli", role: "Batsman", team: "Royal Challengers Bengaluru", basePrice: 2, auctionPrice: 21, isRetained: true },
  { name: "Rajat Patidar", role: "Batsman", team: "Royal Challengers Bengaluru", basePrice: 0.75, auctionPrice: 11, isRetained: true },
  { name: "Yash Dayal", role: "Bowler", team: "Royal Challengers Bengaluru", basePrice: 0.75, auctionPrice: 5, isRetained: true },

  // Kolkata Knight Riders - Retained
  { name: "Rinku Singh", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 1, auctionPrice: 13, isRetained: true },
  { name: "Varun Chakravarthy", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 1, auctionPrice: 12, isRetained: true },
  { name: "Sunil Narine", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 2, auctionPrice: 12, isRetained: true },
  { name: "Andre Russell", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 2, auctionPrice: 12, isRetained: true },
  { name: "Harshit Rana", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 0.75, auctionPrice: 4, isRetained: true },
  { name: "Ramandeep Singh", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 0.75, auctionPrice: 4, isRetained: true },

  // Rajasthan Royals - Retained
  { name: "Sanju Samson", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 18, auctionPrice: 18, isRetained: true },
  { name: "Yashasvi Jaiswal", role: "Batsman", team: "Rajasthan Royals", basePrice: 18, auctionPrice: 18, isRetained: true },
  { name: "Riyan Parag", role: "All-rounder", team: "Rajasthan Royals", basePrice: 14, auctionPrice: 14, isRetained: true },
  { name: "Dhruv Jurel", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 14, auctionPrice: 14, isRetained: true },
  { name: "Shimron Hetmyer", role: "Batsman", team: "Rajasthan Royals", basePrice: 11, auctionPrice: 11, isRetained: true },
  { name: "Sandeep Sharma", role: "Bowler", team: "Rajasthan Royals", basePrice: 4, auctionPrice: 4, isRetained: true },

  // Sunrisers Hyderabad - Retained
  { name: "Heinrich Klaasen", role: "Wicket-keeper", team: "Sunrisers Hyderabad", basePrice: 23, auctionPrice: 23, isRetained: true },
  { name: "Pat Cummins", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 18, auctionPrice: 18, isRetained: true },
  { name: "Abhishek Sharma", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 14, auctionPrice: 14, isRetained: true },
  { name: "Travis Head", role: "Batsman", team: "Sunrisers Hyderabad", basePrice: 14, auctionPrice: 14, isRetained: true },
  { name: "Nitish Kumar Reddy", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 6, auctionPrice: 6, isRetained: true },

  // Lucknow Super Giants - Retained
  { name: "Nicholas Pooran", role: "Wicket-keeper", team: "Lucknow Super Giants", basePrice: 21, auctionPrice: 21, isRetained: true },
  { name: "Ravi Bishnoi", role: "Bowler", team: "Lucknow Super Giants", basePrice: 11, auctionPrice: 11, isRetained: true },
  { name: "Mayank Yadav", role: "Bowler", team: "Lucknow Super Giants", basePrice: 11, auctionPrice: 11, isRetained: true },
  { name: "Mohsin Khan", role: "Bowler", team: "Lucknow Super Giants", basePrice: 4, auctionPrice: 4, isRetained: true },
  { name: "Ayush Badoni", role: "Batsman", team: "Lucknow Super Giants", basePrice: 4, auctionPrice: 4, isRetained: true },

  // Gujarat Titans - Retained
  { name: "Shubman Gill", role: "Batsman", team: "Gujarat Titans", basePrice: 16.50, auctionPrice: 16.50, isRetained: true },
  { name: "Rashid Khan", role: "All-rounder", team: "Gujarat Titans", basePrice: 18, auctionPrice: 18, isRetained: true },
  { name: "Sai Sudharsan", role: "Batsman", team: "Gujarat Titans", basePrice: 8.50, auctionPrice: 8.50, isRetained: true },
  { name: "Rahul Tewatia", role: "All-rounder", team: "Gujarat Titans", basePrice: 8, auctionPrice: 8, isRetained: true },
  { name: "Shahrukh Khan", role: "Batsman", team: "Gujarat Titans", basePrice: 4, auctionPrice: 4, isRetained: true },

  // Delhi Capitals - Retained
  { name: "Axar Patel", role: "All-rounder", team: "Delhi Capitals", basePrice: 16.50, auctionPrice: 16.50, isRetained: true },
  { name: "Kuldeep Yadav", role: "Bowler", team: "Delhi Capitals", basePrice: 13.25, auctionPrice: 13.25, isRetained: true },
  { name: "Tristan Stubbs", role: "Batsman", team: "Delhi Capitals", basePrice: 10, auctionPrice: 10, isRetained: true },
  { name: "Abishek Porel", role: "Wicket-keeper", team: "Delhi Capitals", basePrice: 4, auctionPrice: 4, isRetained: true },

  // Punjab Kings - Retained  
  { name: "Prabhsimran Singh", role: "Wicket-keeper", team: "Punjab Kings", basePrice: 4, auctionPrice: 4, isRetained: true },
  { name: "Shashank Singh", role: "All-rounder", team: "Punjab Kings", basePrice: 5.50, auctionPrice: 5.50, isRetained: true },

  // ============ MAJOR AUCTION BUYS ============
  // Base prices: ₹2Cr (top intl), ₹1.5Cr, ₹1Cr, ₹75L, ₹50L, ₹40L, ₹30L (min capped), ₹20L (uncapped)
  
  // Mumbai Indians - Auction Buys
  { name: "Trent Boult", role: "Bowler", team: "Mumbai Indians", basePrice: 2, auctionPrice: 12.50 },
  { name: "Deepak Chahar", role: "Bowler", team: "Mumbai Indians", basePrice: 2, auctionPrice: 9.25 },
  { name: "Naman Dhir", role: "All-rounder", team: "Mumbai Indians", basePrice: 0.30, auctionPrice: 5.25 },
  { name: "Robin Minz", role: "Wicket-keeper", team: "Mumbai Indians", basePrice: 0.30, auctionPrice: 0.65 },
  { name: "Karn Sharma", role: "Bowler", team: "Mumbai Indians", basePrice: 0.30, auctionPrice: 0.50 },
  { name: "Ryan Rickelton", role: "Batsman", team: "Mumbai Indians", basePrice: 0.75, auctionPrice: 1 },
  { name: "Will Jacks", role: "All-rounder", team: "Mumbai Indians", basePrice: 1.5, auctionPrice: 5.25 },

  // Chennai Super Kings - Auction Buys
  { name: "Devon Conway", role: "Batsman", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 6.25 },
  { name: "Rahul Tripathi", role: "Batsman", team: "Chennai Super Kings", basePrice: 1, auctionPrice: 3.40 },
  { name: "Rachin Ravindra", role: "All-rounder", team: "Chennai Super Kings", basePrice: 1.5, auctionPrice: 4 },
  { name: "Vijay Shankar", role: "All-rounder", team: "Chennai Super Kings", basePrice: 0.50, auctionPrice: 1.20 },
  { name: "Sam Curran", role: "All-rounder", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 2.40 },
  { name: "Khaleel Ahmed", role: "Bowler", team: "Chennai Super Kings", basePrice: 1, auctionPrice: 4.80 },
  { name: "Noor Ahmad", role: "Bowler", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 10 },
  { name: "Gurjapneet Singh", role: "Bowler", team: "Chennai Super Kings", basePrice: 0.30, auctionPrice: 2.20 },

  // Royal Challengers Bengaluru - Auction Buys
  { name: "Liam Livingstone", role: "All-rounder", team: "Royal Challengers Bengaluru", basePrice: 2, auctionPrice: 8.75 },
  { name: "Phil Salt", role: "Wicket-keeper", team: "Royal Challengers Bengaluru", basePrice: 2, auctionPrice: 11.50 },
  { name: "Jitesh Sharma", role: "Wicket-keeper", team: "Royal Challengers Bengaluru", basePrice: 1, auctionPrice: 11 },
  { name: "Josh Hazlewood", role: "Bowler", team: "Royal Challengers Bengaluru", basePrice: 2, auctionPrice: 12.50 },
  { name: "Krunal Pandya", role: "All-rounder", team: "Royal Challengers Bengaluru", basePrice: 2, auctionPrice: 5.75 },
  { name: "Bhuvneshwar Kumar", role: "Bowler", team: "Royal Challengers Bengaluru", basePrice: 2, auctionPrice: 10.75 },
  { name: "Suyash Sharma", role: "Bowler", team: "Royal Challengers Bengaluru", basePrice: 0.30, auctionPrice: 2.60 },
  { name: "Swapnil Singh", role: "All-rounder", team: "Royal Challengers Bengaluru", basePrice: 0.30, auctionPrice: 0.50 },
  { name: "Tim David", role: "All-rounder", team: "Royal Challengers Bengaluru", basePrice: 1.5, auctionPrice: 3 },
  { name: "Romario Shepherd", role: "All-rounder", team: "Royal Challengers Bengaluru", basePrice: 0.75, auctionPrice: 1.50 },
  { name: "Jacob Bethell", role: "All-rounder", team: "Royal Challengers Bengaluru", basePrice: 0.75, auctionPrice: 2.60 },
  { name: "Lungi Ngidi", role: "Bowler", team: "Royal Challengers Bengaluru", basePrice: 1, auctionPrice: 1 },

  // Kolkata Knight Riders - Auction Buys
  { name: "Quinton de Kock", role: "Wicket-keeper", team: "Kolkata Knight Riders", basePrice: 2, auctionPrice: 3.60 },
  { name: "Rahmanullah Gurbaz", role: "Wicket-keeper", team: "Kolkata Knight Riders", basePrice: 1, auctionPrice: 2 },
  { name: "Anrich Nortje", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 2, auctionPrice: 6.50 },
  { name: "Spencer Johnson", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 1, auctionPrice: 2.80 },
  { name: "Moeen Ali", role: "All-rounder", team: "Kolkata Knight Riders", basePrice: 2, auctionPrice: 2 },
  { name: "Manish Pandey", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 0.50, auctionPrice: 0.75 },
  { name: "Ajinkya Rahane", role: "Batsman", team: "Kolkata Knight Riders", basePrice: 1.5, auctionPrice: 1.50 },
  { name: "Mayank Markande", role: "Bowler", team: "Kolkata Knight Riders", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Luvnith Sisodia", role: "Wicket-keeper", team: "Kolkata Knight Riders", basePrice: 0.30, auctionPrice: 0.30 },

  // Delhi Capitals - Auction Buys
  { name: "Harry Brook", role: "Batsman", team: "Delhi Capitals", basePrice: 2, auctionPrice: 6.25 },
  { name: "Jake Fraser-McGurk", role: "Batsman", team: "Delhi Capitals", basePrice: 1, auctionPrice: 9 },
  { name: "T Natarajan", role: "Bowler", team: "Delhi Capitals", basePrice: 2, auctionPrice: 10.75 },
  { name: "Karun Nair", role: "Batsman", team: "Delhi Capitals", basePrice: 1, auctionPrice: 50 },
  { name: "Faf du Plessis", role: "Batsman", team: "Delhi Capitals", basePrice: 2, auctionPrice: 2 },
  { name: "Sameer Rizvi", role: "Batsman", team: "Delhi Capitals", basePrice: 0.30, auctionPrice: 0.95 },
  { name: "Ashutosh Sharma", role: "All-rounder", team: "Delhi Capitals", basePrice: 0.30, auctionPrice: 3.80 },
  { name: "Mohit Sharma", role: "Bowler", team: "Delhi Capitals", basePrice: 1, auctionPrice: 2.20 },
  { name: "Darshan Nalkande", role: "All-rounder", team: "Delhi Capitals", basePrice: 0.30, auctionPrice: 0.30 },

  // Rajasthan Royals - Auction Buys
  { name: "Jofra Archer", role: "Bowler", team: "Rajasthan Royals", basePrice: 2, auctionPrice: 12.50 },
  { name: "Maheesh Theekshana", role: "Bowler", team: "Rajasthan Royals", basePrice: 1.5, auctionPrice: 4.40 },
  { name: "Wanindu Hasaranga", role: "All-rounder", team: "Rajasthan Royals", basePrice: 2, auctionPrice: 5.25 },
  { name: "Tushar Deshpande", role: "Bowler", team: "Rajasthan Royals", basePrice: 1, auctionPrice: 6.50 },
  { name: "Shubham Dubey", role: "Batsman", team: "Rajasthan Royals", basePrice: 0.30, auctionPrice: 0.80 },
  { name: "Fazalhaq Farooqi", role: "Bowler", team: "Rajasthan Royals", basePrice: 1, auctionPrice: 2 },
  { name: "Kumar Kartikeya", role: "Bowler", team: "Rajasthan Royals", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Kunal Singh Rathore", role: "Wicket-keeper", team: "Rajasthan Royals", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Akash Madhwal", role: "Bowler", team: "Rajasthan Royals", basePrice: 0.40, auctionPrice: 1.20 },

  // Punjab Kings - Auction Buys
  { name: "Marcus Stoinis", role: "All-rounder", team: "Punjab Kings", basePrice: 2, auctionPrice: 11 },
  { name: "Glenn Maxwell", role: "All-rounder", team: "Punjab Kings", basePrice: 2, auctionPrice: 4.20 },
  { name: "Nehal Wadhera", role: "Batsman", team: "Punjab Kings", basePrice: 0.50, auctionPrice: 4.20 },
  { name: "Harpreet Brar", role: "All-rounder", team: "Punjab Kings", basePrice: 0.50, auctionPrice: 1.50 },
  { name: "Vishnu Vinod", role: "Wicket-keeper", team: "Punjab Kings", basePrice: 0.30, auctionPrice: 0.95 },
  { name: "Suryansh Shedge", role: "All-rounder", team: "Punjab Kings", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Josh Inglis", role: "Wicket-keeper", team: "Punjab Kings", basePrice: 1, auctionPrice: 2.60 },
  { name: "Aaron Hardie", role: "All-rounder", team: "Punjab Kings", basePrice: 0.75, auctionPrice: 1.25 },
  { name: "Marco Jansen", role: "All-rounder", team: "Punjab Kings", basePrice: 2, auctionPrice: 7 },
  { name: "Lockie Ferguson", role: "Bowler", team: "Punjab Kings", basePrice: 2, auctionPrice: 2 },
  { name: "Azmatullah Omarzai", role: "All-rounder", team: "Punjab Kings", basePrice: 1, auctionPrice: 2.40 },
  { name: "Xavier Bartlett", role: "Bowler", team: "Punjab Kings", basePrice: 0.50, auctionPrice: 0.80 },
  { name: "Priyansh Arya", role: "Batsman", team: "Punjab Kings", basePrice: 0.30, auctionPrice: 3.80 },
  { name: "Pravin Dubey", role: "Bowler", team: "Punjab Kings", basePrice: 0.30, auctionPrice: 0.30 },

  // Sunrisers Hyderabad - Auction Buys
  { name: "Rahul Chahar", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 1, auctionPrice: 3 },
  { name: "Harshal Patel", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 2, auctionPrice: 8 },
  { name: "Adam Zampa", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 2, auctionPrice: 2.40 },
  { name: "Ishan Kishan", role: "Wicket-keeper", team: "Sunrisers Hyderabad", basePrice: 2, auctionPrice: 11.25 },
  { name: "Abhinav Manohar", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 0.30, auctionPrice: 3.20 },
  { name: "Atharva Taide", role: "Batsman", team: "Sunrisers Hyderabad", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Kamindu Mendis", role: "All-rounder", team: "Sunrisers Hyderabad", basePrice: 0.75, auctionPrice: 0.75 },
  { name: "Simarjeet Singh", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 0.50, auctionPrice: 1.50 },
  { name: "Jaydev Unadkat", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 1, auctionPrice: 1 },
  { name: "Zeeshan Ansari", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 0.30, auctionPrice: 0.40 },
  { name: "Eshan Malinga", role: "Bowler", team: "Sunrisers Hyderabad", basePrice: 0.30, auctionPrice: 1.20 },

  // Lucknow Super Giants - Auction Buys
  { name: "David Miller", role: "Batsman", team: "Lucknow Super Giants", basePrice: 2, auctionPrice: 7.50 },
  { name: "Aiden Markram", role: "Batsman", team: "Lucknow Super Giants", basePrice: 2, auctionPrice: 10.75 },
  { name: "Mitchell Marsh", role: "All-rounder", team: "Lucknow Super Giants", basePrice: 2, auctionPrice: 3.40 },
  { name: "Avesh Khan", role: "Bowler", team: "Lucknow Super Giants", basePrice: 2, auctionPrice: 9.75 },
  { name: "Abdul Samad", role: "All-rounder", team: "Lucknow Super Giants", basePrice: 0.75, auctionPrice: 4.20 },
  { name: "Shamar Joseph", role: "Bowler", team: "Lucknow Super Giants", basePrice: 1, auctionPrice: 2.40 },
  { name: "Matthew Breetzke", role: "Batsman", team: "Lucknow Super Giants", basePrice: 0.50, auctionPrice: 0.75 },
  { name: "Digvesh Singh", role: "Bowler", team: "Lucknow Super Giants", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Akash Singh", role: "Bowler", team: "Lucknow Super Giants", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Arshin Kulkarni", role: "All-rounder", team: "Lucknow Super Giants", basePrice: 0.30, auctionPrice: 0.30 },

  // Gujarat Titans - Auction Buys
  { name: "Mohammed Siraj", role: "Bowler", team: "Gujarat Titans", basePrice: 2, auctionPrice: 12.25 },
  { name: "Prasidh Krishna", role: "Bowler", team: "Gujarat Titans", basePrice: 2, auctionPrice: 6 },
  { name: "Washington Sundar", role: "All-rounder", team: "Gujarat Titans", basePrice: 1, auctionPrice: 3.20 },
  { name: "Gerald Coetzee", role: "Bowler", team: "Gujarat Titans", basePrice: 1, auctionPrice: 2.40 },
  { name: "Nishant Sindhu", role: "All-rounder", team: "Gujarat Titans", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Mahipal Lomror", role: "All-rounder", team: "Gujarat Titans", basePrice: 0.50, auctionPrice: 1.70 },
  { name: "Kumar Kushagra", role: "Wicket-keeper", team: "Gujarat Titans", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Anuj Rawat", role: "Wicket-keeper", team: "Gujarat Titans", basePrice: 0.30, auctionPrice: 0.30 },
  { name: "Ishant Sharma", role: "Bowler", team: "Gujarat Titans", basePrice: 0.75, auctionPrice: 0.75 },
  { name: "Jayant Yadav", role: "All-rounder", team: "Gujarat Titans", basePrice: 0.50, auctionPrice: 0.75 },
  { name: "Glenn Phillips", role: "Batsman", team: "Gujarat Titans", basePrice: 2, auctionPrice: 2 },

  // ============ ADDITIONAL NOTABLE PLAYERS ============
  { name: "Ravichandran Ashwin", role: "All-rounder", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 9.75 },
  { name: "Prithvi Shaw", role: "Batsman", team: "Team TBD", basePrice: 0.75, auctionPrice: 0.75 },
  { name: "David Warner", role: "Batsman", team: "Team TBD", basePrice: 2, auctionPrice: 2 },
  { name: "Umran Malik", role: "Bowler", team: "Team TBD", basePrice: 0.75, auctionPrice: 0.75 },
  { name: "Sarfaraz Khan", role: "Batsman", team: "Delhi Capitals", basePrice: 1, auctionPrice: 2.60 },
  { name: "Donovan Ferreira", role: "Batsman", team: "Team TBD", basePrice: 0.50, auctionPrice: 0.75 },
  { name: "Mukesh Kumar", role: "Bowler", team: "Delhi Capitals", basePrice: 2, auctionPrice: 8 },
  { name: "Dushmantha Chameera", role: "Bowler", team: "Team TBD", basePrice: 0.75, auctionPrice: 0.75 },
  { name: "Naveen-ul-Haq", role: "Bowler", team: "Team TBD", basePrice: 0.75, auctionPrice: 0.75 },
  { name: "Mustafizur Rahman", role: "Bowler", team: "Chennai Super Kings", basePrice: 2, auctionPrice: 2 },
];

// IPL base price slabs (in Crores): 2, 1.5, 1, 0.75, 0.5, 0.3, 0.2
function getIPLBasePrice(player) {
  if (player.isMarquee) return 2;
  if (player.isRetained && player.isUncapped) return 0.75;
  if (player.isRetained) return 2;
  if (player.isUncapped) return 0.2;
  // Overseas capped: 2, 1.5, 1
  if (player.role && player.role.includes('Overseas')) return 2;
  // Capped Indian: 2, 1.5, 1, 0.75, 0.5
  if (player.basePrice >= 1.5) return player.basePrice;
  if (player.basePrice >= 1) return player.basePrice;
  if (player.basePrice >= 0.75) return player.basePrice;
  if (player.basePrice >= 0.5) return player.basePrice;
  if (player.basePrice >= 0.3) return player.basePrice;
  return 0.2;
}


// Shuffle and create player pool with realistic 2025 IPL auction data
function createPlayers() {
  // Sort by base price (marquee players first) then shuffle within categories
  const marquee = IPL_PLAYERS.filter(p => p.basePrice >= 15);
  const midRange = IPL_PLAYERS.filter(p => p.basePrice >= 5 && p.basePrice < 15);
  const budget = IPL_PLAYERS.filter(p => p.basePrice < 5);
  
  // Shuffle each category
  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);
  
  // Combine: Some marquee first, then mix
  const ordered = [
    ...shuffleArray(marquee).slice(0, 5), // Top 5 marquee players first
    ...shuffleArray([...shuffleArray(marquee).slice(5), ...shuffleArray(midRange), ...shuffleArray(budget)])
  ];
  
  return ordered.map((player, i) => {
    // Calculate realistic stats based on player's auction value
    const valueMultiplier = Math.min(player.basePrice / 10, 2.5); // 0-2.5 range
    const isElite = player.basePrice >= 15;
    const isMidTier = player.basePrice >= 5 && player.basePrice < 15;
    
    // Role-based stat generation
    const isBatter = player.role.includes('Batsman') || player.role.includes('Wicket-keeper');
    const isBowler = player.role.includes('Bowler');
    const isAllrounder = player.role.includes('All-rounder');
    
    // Matches based on player stature
    const baseMatches = isElite ? 120 : (isMidTier ? 60 : 25);
    const matches = Math.floor(baseMatches + Math.random() * 80);
    
    // Batting stats
    let runs, average, strikeRate;
    if (isBatter || isAllrounder) {
      const battingQuality = valueMultiplier + (Math.random() * 0.5);
      runs = Math.floor(matches * (25 + battingQuality * 20) + Math.random() * 1000);
      average = parseFloat((22 + battingQuality * 12 + Math.random() * 8).toFixed(2));
      strikeRate = parseFloat((115 + battingQuality * 25 + Math.random() * 15).toFixed(2));
    } else {
      runs = Math.floor(matches * 5 + Math.random() * 200);
      average = parseFloat((12 + Math.random() * 10).toFixed(2));
      strikeRate = parseFloat((100 + Math.random() * 30).toFixed(2));
    }
    
    // Bowling stats
    let wickets, economy;
    if (isBowler || isAllrounder) {
      const bowlingQuality = valueMultiplier + (Math.random() * 0.5);
      wickets = Math.floor(matches * (0.8 + bowlingQuality * 0.4) + Math.random() * 30);
      economy = parseFloat((9.5 - bowlingQuality * 1.5 - Math.random() * 1).toFixed(2));
      economy = Math.max(6.5, economy); // Minimum economy
    } else {
      wickets = Math.floor(Math.random() * 10);
      economy = parseFloat((8 + Math.random() * 2).toFixed(2));
    }
    
    // Calculate overall rating (60-99 scale)
    let rating;
    if (player.basePrice >= 20) {
      rating = 92 + Math.floor(Math.random() * 7); // 92-98
    } else if (player.basePrice >= 15) {
      rating = 87 + Math.floor(Math.random() * 6); // 87-92
    } else if (player.basePrice >= 10) {
      rating = 80 + Math.floor(Math.random() * 8); // 80-87
    } else if (player.basePrice >= 5) {
      rating = 72 + Math.floor(Math.random() * 9); // 72-80
    } else if (player.basePrice >= 2) {
      rating = 65 + Math.floor(Math.random() * 8); // 65-72
    } else {
      rating = 55 + Math.floor(Math.random() * 12); // 55-66
    }
    
    return {
      id: `player-${i}`,
      name: player.name,
      role: player.role,
      basePrice: player.basePrice,
      auctionPrice: player.auctionPrice || player.basePrice,
      previousTeam: player.team,
      isMarquee: player.isMarquee || false,
      isRetained: player.isRetained || false,
      isUncapped: player.isUncapped || false,
      stats: {
        matches,
        runs,
        wickets,
        average,
        strikeRate,
        economy
      },
      rating
    };
  });
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
