// Original category prompts based on common quiz topics. Facts checked against the linked archives.
// Depth tiers are editorial, never claimed to be live response frequencies.
const sources = {
  world:['FIFA World Cup champions','https://www.fifa.com/en/tournaments/mens/worldcup/articles/world-cup-champions-1982-2026-italy-argentina-germany-brazil-france-spain'],
  hosts:['FIFA tournament archive','https://www.archives.fifa.com/fifa_world_cup'],
  cl:['UEFA Champions League history','https://www.uefa.com/uefachampionsleague/history/'],
  pl:['Premier League history','https://www.premierleague.com/en/news/58905'],
  euro:['UEFA EURO roll of honour','https://www.uefa.com/news/0253-0d81c56ff408-45bf000cd5b6-1000--euro-roll-of-honour/'],
  ballon:['UEFA Ballon d’Or winners','https://www.uefa.com/ballondor/news/0287-195e642735da-0594342b9554-1000--history-of-the-ball-on-d-or-all-the-winners/'],
  messi:['UEFA Ballon d’Or laureates and clubs','https://www.uefa.com/ballondor/news/0292-1c27056169a7-bc88d1fdba43-1000--ballon-d-or-laureates-who-has-won-football-s-most-prestig/'],
  ronaldo:['UEFA Cristiano Ronaldo club record','https://www.uefa.com/uefachampionsleague/news/02a7-2136b8f054ea-76a61b3f9d24-1000--cristiano-ronaldo-in-the-champions-league-records-stats-wh/'],
  semi22:['FIFA Qatar 2022','https://www.fifa.com/en/tournaments/mens/worldcup/qatar2022'],
  semi24:['UEFA EURO 2024 results','https://www.uefa.com/uefaeuro/history/news/0275-151eb1c333ea-d30deec67b13-1000--uefa-euro-2024-results-when-and-where-were-the-matches/'],
};
function q(reference,category,kind,prompt,rows,clarify) {
  const [sourceName,source]=sources[reference];
  return {category,kind,prompt,sourceName,source,difficulty:'Easy–medium',clarify,
    answers:rows.map(([points,names])=>[points,...names.split('|')])};
}
const united='Manchester United|Man United|Man Utd|Manchester Utd|ManchesterUnited|ManU|Man U';
const city='Manchester City|Man City|ManchesterCity|ManCity';
const barca='Barcelona|FC Barcelona|Barca|Barça';
const real='Real Madrid|Real Madrid CF|Madrid';
const bayern='Bayern Munich|Bayern|Bayern München|Bayern Munchen|FC Bayern';
const inter='Inter Milan|Inter|Internazionale|FC Internazionale';
const psg='Paris Saint-Germain|PSG|Paris Saint Germain|Paris';
const holland='Netherlands|The Netherlands|Holland|Nederland';
export const easyDays = {
 '2026-11-17':[
  q('world','World Cup winners','country','Name a country that won the men’s World Cup between 1998 and 2022.',[
    [25,'Brazil|Brasil|Brazilija'],[25,'France|Francuska'],[45,'Argentina'],[65,'Germany|Deutschland|Njemačka'],
    [85,'Italy|Italia|Italija'],[100,'Spain|España|Espana|Španija'],
  ]),
  q('cl','Champions League','club','Name a club that won the Champions League between 2000 and 2024.',[
    [25,real],[25,barca],[45,bayern],[45,'Liverpool|Liverpool FC'],[45,united],
    [65,'AC Milan|Milan|A C Milan'],[65,'Chelsea|Chelsea FC'],[85,inter],[85,city],[100,'Porto|FC Porto'],
  ],{input:'Manchester',hint:'Do you mean Manchester United or Manchester City?'}),
  q('pl','Premier League','club','Name a Premier League title-winning club (1992/93–2023/24).',[
    [25,united],[25,city],[45,'Liverpool|Liverpool FC'],[65,'Chelsea|Chelsea FC'],[65,'Arsenal|Arsenal FC'],
    [85,'Leicester City|Leicester'],[100,'Blackburn Rovers|Blackburn'],
  ],{input:'Manchester',hint:'Do you mean Manchester United or Manchester City?'}),
  q('euro','European champions','country','Name a country that won the men’s EURO between 1988 and 2020.',[
    [25,'Spain|España|Espana|Španija'],[45,'France|Francuska'],[45,'Germany|Deutschland|Njemačka'],
    [65,'Italy|Italia|Italija'],[65,'Portugal'],[85,holland],[85,'Greece|Grčka'],[100,'Denmark|Danska'],
  ]),
  q('hosts','World Cup hosts','country','Name a country that hosted the men’s World Cup between 1998 and 2022. One co-host is enough.',[
    [25,'Qatar|Katar'],[25,'Brazil|Brasil|Brazilija'],[45,'Germany|Deutschland|Njemačka'],[45,'France|Francuska'],
    [65,'Russia|Rusija'],[85,'South Africa|Južna Afrika|Juzna Afrika'],[85,'Japan'],[100,'South Korea|Korea Republic|Republic of Korea|Korea|Južna Koreja|Juzna Koreja'],
  ]),
  q('ballon','Ballon d’Or','player','Name a men’s Ballon d’Or winner between 2000 and 2023.',[
    [25,'Lionel Messi|Messi|Leo Messi'],[25,'Cristiano Ronaldo|Cristiano|CR7'],[45,'Ronaldinho|Ronaldinho Gaucho'],
    [45,'Karim Benzema|Benzema'],[65,'Luka Modrić|Modric|Luka Modric'],[65,'Kaká|Kaka'],
    [65,'Ronaldo Nazário|Ronaldo Nazario|R9|Brazilian Ronaldo|Ronaldo'],
    [85,'Luís Figo|Luis Figo|Figo'],[85,'Fabio Cannavaro|Cannavaro'],[85,'Andriy Shevchenko|Shevchenko|Sheva'],
    [100,'Michael Owen|Owen'],[100,'Pavel Nedvěd|Pavel Nedved|Nedved'],
  ]),
 ],
 '2026-11-18':[
  q('semi22','Qatar 2022','country','Name a team that reached the 2022 men’s World Cup semi-finals.',[
    [25,'Argentina'],[45,'France|Francuska'],[85,'Croatia|Hrvatska'],[100,'Morocco|Maroko'],
  ]),
  q('messi','Lionel Messi','club','Name one of Messi’s senior first-team clubs by the end of 2023.',[
    [25,barca],[65,psg],[100,'Inter Miami|Inter Miami CF|Miami'],
  ]),
  q('ronaldo','Cristiano Ronaldo','club','Name a club Cristiano Ronaldo scored for in the Champions League (group stage onwards).',[
    [25,real],[65,united],[100,'Juventus|Juve|Juventus FC'],
  ]),
  q('semi24','EURO 2024','country','Name a team that reached the men’s EURO 2024 semi-finals.',[
    [25,'Spain|España|Espana|Španija'],[45,'England|Engleska'],[85,'France|Francuska'],[100,holland],
  ]),
  q('pl','Premier League originals','club','Name a club that played in every Premier League season from 1992/93 to 2023/24.',[
    [25,united],[45,'Liverpool|Liverpool FC'],[45,'Arsenal|Arsenal FC'],[65,'Chelsea|Chelsea FC'],
    [85,'Tottenham Hotspur|Tottenham|Spurs'],[100,'Everton|Everton FC'],
  ]),
  q('cl','European champions','club','Name a club that won the Champions League between 2010 and 2024.',[
    [25,real],[25,barca],[45,bayern],[65,'Liverpool|Liverpool FC'],[85,'Chelsea|Chelsea FC'],[85,city],[100,inter],
  ]),
 ],
};
