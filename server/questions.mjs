export const challenge = {
  id: 'wembley-001',
  goal: 400,
  stadium: 'Wembley',
  questions: [
    {
      category: 'FIFA World Cup', kind: 'player',
      prompt: 'Name a player who scored for Germany at the 2014 men’s FIFA World Cup.',
      source: 'https://wheecorea.com/wp-content/uploads/2014/08/2014report.pdf', sourceName: 'FIFA technical report, p. 240',
      answers: [
        [25,'Thomas Müller','Müller','Mueller','Thomas Mueller'], [45,'Miroslav Klose','Klose'],
        [45,'Mario Götze','Götze','Goetze','Mario Goetze'], [65,'Toni Kroos','Kroos'],
        [85,'André Schürrle','Schürrle','Schuerrle','Andre Schuerrle'], [85,'Mesut Özil','Özil','Oezil','Mesut Oezil'],
        [100,'Mats Hummels','Hummels'], [100,'Sami Khedira','Khedira'],
      ],
    },
    {
      category: 'UEFA Champions League', kind: 'club',
      prompt: 'Name a club eliminated in the round of 16 of the 2020/21 men’s UEFA Champions League.',
      source: 'https://www.uefa.com/uefachampionsleague/news/0262-10842df9b0ba-783a15c1aa93-1000--quarter-final-fixtures/', sourceName: 'UEFA season results',
      answers: [
        [25,'Barcelona','FC Barcelona','Barça'], [25,'Juventus','Juve','Juventus FC'],
        [45,'Atlético de Madrid','Atlético Madrid','Atlético','Atleti'], [65,'Sevilla','Sevilla FC'],
        [65,'RB Leipzig','Leipzig','RasenBallsport Leipzig'], [85,'Atalanta','Atalanta BC'],
        [85,'Lazio','SS Lazio','S.S. Lazio'], [100,'Borussia Mönchengladbach','Gladbach','Mönchengladbach','Borussia Moenchengladbach','Moenchengladbach'],
      ],
    },
    {
      category: 'Africa Cup of Nations', kind: 'country',
      prompt: 'Name a country that won a men’s Africa Cup of Nations edition from 2000 through 2023.',
      source: 'https://www.cafonline.com/afcon2025/news/before-morocco-2025-the-champions-who-built-afcon-s-legacy/', sourceName: 'CAF list of winners',
      answers: [
        [25,'Egypt'], [45,'Senegal'], [45,'Cameroon','Cameroun'], [65,'Nigeria'],
        [65,'Côte d’Ivoire','Ivory Coast','Cote d Ivoire'], [85,'Algeria'], [100,'Zambia'], [100,'Tunisia'],
      ],
    },
    {
      category: 'Copa Libertadores', kind: 'club',
      prompt: 'Name a club that finished as Copa Libertadores runner-up from 2010 through 2019.',
      source: 'https://www.espn.com.pa/futbol/copa-libertadores/nota/_/id/1321674/el-historial-con-todos-los-campeones-de-la-libertadores', sourceName: 'ESPN final results archive',
      clarify: { input: 'Nacional', hint: 'Which Nacional? Add the club’s country to your answer.' },
      answers: [
        [25,'Boca Juniors','Boca','CA Boca Juniors'], [25,'River Plate','River','CA River Plate'],
        [45,'Peñarol','CA Peñarol'], [65,'Guadalajara','Chivas','Chivas Guadalajara','CD Guadalajara','Club Deportivo Guadalajara'],
        [65,'Olimpia','Club Olimpia','Olimpia Asunción'], [85,'Tigres UANL','Tigres','UANL'],
        [85,'Lanús','CA Lanús'], [100,'Independiente del Valle','IDV'],
        [100,'Nacional (Paraguay)','Nacional Paraguay','Club Nacional Paraguay','Nacional Asunción','Nacional de Paraguay'],
      ],
    },
    {
      category: 'FIFA Women’s World Cup', kind: 'country',
      prompt: 'Name a team that reached the quarter-finals of the 2023 FIFA Women’s World Cup.',
      source: 'https://www.fifa.com/es/articles/el-fixture-completo-de-la-copa-mundial-de-la-fifa-2023-todos-los-partidos', sourceName: 'FIFA tournament results',
      answers: [
        [25,'Spain','España'], [25,'England'], [45,'Australia','Matildas'], [65,'Sweden','Sverige'],
        [65,'France'], [85,'Japan','Nadeshiko Japan'], [85,'Netherlands','The Netherlands','Holland','Nederland'],
        [100,'Colombia'],
      ],
    },
    {
      category: 'AFC Asian Cup', kind: 'country',
      prompt: 'Name a team that reached the quarter-finals of the AFC Asian Cup Qatar 2023.',
      source: 'https://assets.the-afc.com/Corporate_Page/Technical/Technical_Reports/AFC-Asian-Cup-Qatar-2023%E2%84%A2-Technical-Report.pdf', sourceName: 'AFC technical report, p. 66',
      answers: [
        [25,'Japan'], [25,'South Korea','Korea Republic','Republic of Korea'],
        [45,'Qatar'], [45,'Australia'], [65,'Iran','IR Iran','Islamic Republic of Iran'],
        [85,'Jordan'], [100,'Tajikistan'], [100,'Uzbekistan'],
      ],
    },
  ],
};
