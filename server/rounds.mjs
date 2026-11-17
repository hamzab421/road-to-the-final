import { easyDays } from './easy-questions.mjs';
import { challenge as openingRound } from './questions.mjs';

const sources = {
  euro: ['UEFA EURO finals archive', 'https://www.uefa.com/uefaeuro/history/news/0259-0e5e039dd8b6-ac24fc62a240-1000--all-the-euro-finals-scores-scorers-lineups-and-venues/'],
  women: ['UEFA Women’s Champions League records', 'https://www.uefa.com/news/025b-0ef163bc672f-4f70d38ff3af-1000--women-s-champions-league-records/'],
  europa: ['UEFA Cup and Europa League roll of honour', 'https://www.uefa.com/news/0275-152d42886a65-efc6ff0e2d60-1000--europa-league-roll-of-honour/'],
  asia: ['AFC Asian Cup post-tournament report, p. 22', 'https://assets.the-afc.com/Corporate_Page/Technical/Post-Tournament-Report/AFC-Asian-Cup-Qatar-2023%E2%84%A2-Post-Tournament-Report.pdf'],
  africa: ['CAF Africa Cup of Nations winners', 'https://www.cafonline.com/afcon2025/news/before-morocco-2025-the-champions-who-built-afcon-s-legacy/'],
  cafClub: ['CAF Champions League winners', 'https://www.cafonline.com/caf-champions-league/news/all-you-need-to-know-about-past-winners-of-the-caf-champions-league/'],
  copa: ['CONMEBOL Copa América finals archive', 'https://copaamerica.com/en/news/copa-america-every-final-history-conmebol'],
  libertadores: ['ESPN Copa Libertadores finals archive', 'https://www.espn.com.pa/futbol/copa-libertadores/nota/_/id/1321674/el-historial-con-todos-los-campeones-de-la-libertadores'],
  gold: ['Concacaf Gold Cup finals and scorers', 'https://www.concacaf.com/news/gold-cup-all-time-final-results-scorers'],
  worldWomen: ['FIFA Women’s World Cup title records', 'https://www.fifa.com/en/tournaments/womens/womensworldcup/articles/teams-most-titles-trophies'],
  worldWomen23: ['FIFA Women’s World Cup 2023 results', 'https://www.fifa.com/es/articles/el-fixture-completo-de-la-copa-mundial-de-la-fifa-2023-todos-los-partidos'],
};

const categories = {
  euro: 'UEFA EURO', women: 'UEFA Women’s Champions League', europa: 'UEFA Europa League',
  asia: 'AFC Asian Cup', africa: 'Africa Cup of Nations', cafClub: 'CAF Champions League',
  copa: 'Copa América', libertadores: 'Copa Libertadores', gold: 'Concacaf Gold Cup',
  worldWomen: 'FIFA Women’s World Cup', worldWomen23: 'FIFA Women’s World Cup',
};

function question(reference, kind, prompt, answers, clarify) {
  const [sourceName, source] = sources[reference];
  const tiers = [25, 45, 65, 85, 100];
  return {
    category: categories[reference], kind, prompt, source, sourceName, clarify,
    answers: answers.map((answer, index) => {
      const tier = Math.round(index * (tiers.length - 1) / (answers.length - 1));
      return [tiers[tier], ...answer.split('|')];
    }),
  };
}

const calendar = [
  openingRound,
  [
    question('euro', 'player', 'Name a player who scored in a men’s UEFA EURO final from 2000 through 2012. Shootouts do not count.', [
      'Fernando Torres|Torres|El Niño', 'David Silva|Silva', 'Jordi Alba|Alba', 'Juan Mata|Mata',
      'David Trezeguet|Trezeguet', 'Sylvain Wiltord|Wiltord', 'Angelos Charisteas|Charisteas',
      'Marco Delvecchio|Delvecchio',
    ]),
    question('libertadores', 'club', 'Name a club that won the Copa Libertadores from 2010 through 2019.', [
      'River Plate|River|CA River Plate', 'Flamengo|CR Flamengo', 'Santos|Santos FC',
      'Corinthians|SC Corinthians', 'Grêmio|Grêmio Porto Alegre', 'Internacional|SC Internacional',
      'Atlético Mineiro|Atlético MG|Galo', 'Atlético Nacional|Atlético Nacional Medellín', 'San Lorenzo|San Lorenzo de Almagro',
    ]),
    question('asia', 'country', 'Name a team that finished as AFC Asian Cup runner-up from the 1992 through 2023 editions.', [
      'Japan', 'South Korea|Korea Republic|Republic of Korea', 'Australia', 'Saudi Arabia|KSA',
      'China PR|China|People’s Republic of China', 'United Arab Emirates|UAE', 'Jordan',
    ]),
    question('europa', 'club', 'Name an Italian club that has won the men’s UEFA Cup or Europa League through the 2025/26 season.', [
      'Inter Milan|Inter|Internazionale|FC Internazionale', 'Juventus|Juve|Juventus FC', 'Napoli|SSC Napoli',
      'Atalanta|Atalanta BC', 'Parma|Parma Calcio',
    ]),
    question('gold', 'country', 'Name a team that lost a men’s Concacaf Gold Cup final from 1991 through 2005.', [
      'United States|USA|US|United States of America', 'Brazil|Brasil', 'Colombia',
      'Costa Rica', 'Panama', 'Honduras',
    ]),
    question('women', 'club', 'Name a club that won the UEFA Women’s Cup or UEFA Women’s Champions League by the 2025 final.', [
      'Barcelona|FC Barcelona|Barça|Barcelona Femení', 'Lyon|OL|OL Lyonnes|Olympique Lyonnais',
      'Arsenal|Arsenal Women|Arsenal WFC', 'Wolfsburg|VfL Wolfsburg',
      'FFC Frankfurt|1. FFC Frankfurt|Frankfurt|Eintracht Frankfurt', 'Turbine Potsdam|Potsdam|1. FFC Turbine Potsdam',
      'Umeå|Umeå IK', 'Duisburg|FCR Duisburg|FCR 2001 Duisburg',
    ]),
  ],
  [
    question('euro', 'player', 'Name a player who started for France in the men’s UEFA EURO 2000 final.', [
      'Zinedine Zidane|Zidane', 'Thierry Henry|Henry', 'Didier Deschamps|Deschamps',
      'Fabien Barthez|Barthez', 'Lilian Thuram|Thuram', 'Patrick Vieira|Vieira',
      'Laurent Blanc|Blanc', 'Marcel Desailly|Desailly', 'Bixente Lizarazu|Lizarazu',
      'Youri Djorkaeff|Djorkaeff', 'Christophe Dugarry|Dugarry',
    ]),
    question('copa', 'country', 'Name a team that finished as men’s Copa América runner-up from 1993 through 2011.', [
      'Argentina', 'Brazil|Brasil', 'Mexico|México', 'Uruguay', 'Paraguay', 'Bolivia',
    ]),
    question('asia', 'country', 'Name a country that hosted or co-hosted an AFC Asian Cup edition from 1992 through 2023.', [
      'Qatar', 'Japan', 'Australia', 'China PR|China|People’s Republic of China', 'United Arab Emirates|UAE',
      'Thailand', 'Indonesia', 'Malaysia', 'Vietnam|Viet Nam', 'Lebanon',
    ]),
    question('cafClub', 'club', 'Name a club that won the men’s CAF Champions League from 2000 through 2010.', [
      'Al Ahly|Al Ahly Cairo|Al Ahly SC', 'Zamalek|Zamalek SC', 'TP Mazembe|Mazembe',
      'Enyimba|Enyimba FC', 'Étoile du Sahel|Étoile Sportive du Sahel|ES Sahel', 'Hearts of Oak|Accra Hearts of Oak',
    ]),
    question('gold', 'player', 'Name a player who scored for Mexico in a men’s Concacaf Gold Cup final from 2007 through 2011.', [
      'Andrés Guardado|Guardado', 'Carlos Vela|Vela', 'Giovani dos Santos|Giovani',
      'Pablo Barrera|Barrera', 'Gerardo Torrado|Torrado', 'Guillermo Franco|Guille Franco',
      'José Antonio Castro|José Castro',
    ]),
    question('worldWomen', 'country', 'Name a country that had won the FIFA Women’s World Cup by the end of the 2023 tournament.', [
      'United States|USA|US|United States of America', 'Spain|España', 'Germany|Deutschland', 'Japan', 'Norway|Norge',
    ]),
  ],
  [
    question('euro', 'player', 'Name a player who started for Italy in the men’s UEFA EURO 2012 final.', [
      'Andrea Pirlo|Pirlo', 'Gianluigi Buffon|Buffon', 'Mario Balotelli|Balotelli', 'Giorgio Chiellini|Chiellini',
      'Leonardo Bonucci|Bonucci', 'Daniele De Rossi|De Rossi', 'Antonio Cassano|Cassano',
      'Claudio Marchisio|Marchisio', 'Andrea Barzagli|Barzagli', 'Riccardo Montolivo|Montolivo', 'Ignazio Abate|Abate',
    ]),
    question('europa', 'club', 'Name a German club that has won the men’s UEFA Cup or Europa League through the 2025/26 season.', [
      'Bayern Munich|Bayern|Bayern München|Bayern Muenchen|FC Bayern',
      'Bayer Leverkusen|Bayer 04 Leverkusen|Leverkusen', 'Eintracht Frankfurt|Eintracht|Frankfurt',
      'Schalke 04|Schalke|FC Schalke 04', 'Borussia Mönchengladbach|Gladbach|Mönchengladbach|Borussia Moenchengladbach',
    ]),
    question('libertadores', 'club', 'Name a club that finished as Copa Libertadores runner-up from 2020 through 2025.', [
      'Boca Juniors|Boca|CA Boca Juniors', 'Flamengo|CR Flamengo', 'Palmeiras|SE Palmeiras',
      'Santos|Santos FC', 'Atlético Mineiro|Atlético MG|Galo', 'Athletico Paranaense|Athletico PR|Atlético Paranaense|CAP',
    ]),
    question('asia', 'country', 'Name a country that won the AFC Asian Cup before the year 2000.', [
      'Japan', 'South Korea|Korea Republic|Republic of Korea', 'Saudi Arabia|KSA',
      'Iran|IR Iran|Islamic Republic of Iran', 'Kuwait', 'Israel',
    ]),
    question('gold', 'venue', 'Name a stadium that hosted a men’s Concacaf Gold Cup final from 1991 through 2015.', [
      'Estadio Azteca|Azteca|Azteca Stadium', 'Rose Bowl|Rose Bowl Stadium',
      'Los Angeles Memorial Coliseum|LA Memorial Coliseum|Memorial Coliseum|LA Coliseum|Los Angeles Coliseum',
      'Soldier Field', 'Giants Stadium', 'Lincoln Financial Field|The Linc',
    ]),
    question('women', 'club', 'Name a club that finished as UEFA Women’s Champions League runner-up from the 2010 through 2018 finals.', [
      'Lyon|OL|OL Lyonnes|Olympique Lyonnais', 'Wolfsburg|VfL Wolfsburg',
      'Paris Saint-Germain|PSG|Paris Saint Germain|Paris SG',
      'FFC Frankfurt|1. FFC Frankfurt|Frankfurt|Eintracht Frankfurt',
      'Turbine Potsdam|Potsdam|1. FFC Turbine Potsdam', 'Tyresö|Tyresö FF',
    ]),
  ],
  [
    question('euro', 'player', 'Name a player who started for Portugal in the men’s UEFA EURO 2016 final.', [
      'Cristiano Ronaldo|Cristiano|CR7', 'Pepe|Képler Laveran Lima Ferreira', 'Nani|Luís Carlos Almeida da Cunha',
      'Renato Sanches|Sanches', 'Rui Patrício|Patrício', 'Raphaël Guerreiro|Guerreiro', 'William Carvalho',
      'João Mário', 'José Fonte|Fonte', 'Cédric Soares|Cédric', 'Adrien Silva',
    ]),
    question('copa', 'country', 'Name a team that contested a men’s Copa América final from 1975 through 1987.', [
      'Brazil|Brasil', 'Uruguay', 'Colombia', 'Chile', 'Peru', 'Paraguay',
    ]),
    question('gold', 'player', 'Name a player who scored for the United States in a men’s Concacaf Gold Cup final from 2000 through 2015. Shootouts do not count.', [
      'Landon Donovan|Donovan', 'Michael Bradley|Bradley', 'Brek Shea|Shea',
      'Benny Feilhaber|Feilhaber', 'Josh Wolff|Wolff', 'Jeff Agoos|Agoos',
    ]),
    question('cafClub', 'club', 'Name a club that won the men’s CAF Champions League from 2011 through 2025.', [
      'Al Ahly|Al Ahly Cairo|Al Ahly SC', 'Espérance de Tunis|Espérance|Espérance Sportive de Tunis|EST',
      'Wydad Casablanca|Wydad|Wydad AC|WAC', 'Mamelodi Sundowns|Sundowns', 'TP Mazembe|Mazembe',
      'ES Sétif|Entente Sétif|Entente Sportive de Sétif|Sétif', 'Pyramids FC|Pyramids',
    ]),
    question('europa', 'club', 'Name a Spanish club that has won the men’s UEFA Cup or Europa League through the 2025/26 season.', [
      'Sevilla|Sevilla FC', 'Real Madrid|Real Madrid CF', 'Atlético de Madrid|Atlético Madrid|Atlético|Atleti',
      'Villarreal|Villarreal CF', 'Valencia|Valencia CF',
    ]),
    question('women', 'city', 'Name a city that hosted a UEFA Women’s Champions League final from 2010 through 2018.', [
      'London', 'Madrid', 'Munich|München|Muenchen', 'Berlin', 'Lisbon|Lisboa',
      'Cardiff', 'Kyiv|Kiev', 'Reggio Emilia|Reggio nell’Emilia',
    ]),
  ],
  [
    question('euro', 'player', 'Name a player who scored in a men’s UEFA EURO final from 1988 through 2000. Shootouts do not count.', [
      'Marco van Basten|Van Basten', 'Ruud Gullit|Gullit', 'David Trezeguet|Trezeguet', 'Oliver Bierhoff|Bierhoff',
      'Sylvain Wiltord|Wiltord', 'Patrik Berger|Berger', 'John Jensen|Jensen', 'Kim Vilfort|Vilfort',
      'Marco Delvecchio|Delvecchio',
    ]),
    question('copa', 'country', 'Name a team that finished as men’s Copa América runner-up from 2015 through 2024.', [
      'Argentina', 'Brazil|Brasil', 'Colombia', 'Peru',
    ]),
    question('africa', 'country', 'Name a country that won a men’s Africa Cup of Nations edition from 1957 through 1980.', [
      'Egypt', 'Ghana', 'Nigeria', 'Morocco', 'DR Congo|DRC|Democratic Republic of the Congo|Zaire|Congo-Kinshasa',
      'Sudan', 'Ethiopia', 'Republic of the Congo|Republic of Congo|Congo-Brazzaville',
    ], {input:'Congo', hint:'Which Congo? Add Kinshasa or Brazzaville, or enter the country’s full name.'}),
    question('gold', 'country', 'Name a team that played in a men’s Concacaf Gold Cup final from 2000 through 2015.', [
      'Mexico|México', 'United States|USA|US|United States of America', 'Brazil|Brasil',
      'Canada', 'Costa Rica', 'Colombia', 'Jamaica', 'Panama',
    ]),
    question('europa', 'club', 'Name an English club that has won the men’s UEFA Cup or Europa League through the 2025/26 season.', [
      'Liverpool|Liverpool FC', 'Manchester United|Man United|Man Utd', 'Chelsea|Chelsea FC',
      'Tottenham Hotspur|Tottenham|Spurs', 'Aston Villa|Villa', 'Ipswich Town|Ipswich',
    ]),
    question('women', 'club', 'Name a club that played in a UEFA Women’s Cup final from 2002 through 2009.', [
      'Arsenal|Arsenal Women|Arsenal WFC', 'FFC Frankfurt|1. FFC Frankfurt|Frankfurt|Eintracht Frankfurt',
      'Turbine Potsdam|Potsdam|1. FFC Turbine Potsdam', 'Umeå|Umeå IK',
      'Duisburg|FCR Duisburg|FCR 2001 Duisburg', 'Djurgården|Djurgårdens IF',
      'Fortuna Hjørring|Fortuna Hjorring|Fortuna Hjoerring', 'Zvezda-2005|Zvezda 2005|Zvezda Perm|Zvezda 2005 Perm',
    ]),
  ],
  [
    question('euro', 'player', 'Name a player who started for England in the men’s UEFA EURO 2020 final.', [
      'Harry Kane|Kane', 'Raheem Sterling|Sterling',
      'Jordan Pickford|Pickford', 'Declan Rice|Rice', 'Luke Shaw|Shaw', 'Harry Maguire|Maguire',
      'Kyle Walker|Walker', 'John Stones|Stones', 'Mason Mount|Mount',
      'Kalvin Phillips|Phillips', 'Kieran Trippier|Trippier',
    ]),
    question('libertadores', 'club', 'Name a club that won the Copa Libertadores from 1990 through 1999.', [
      'River Plate|River|CA River Plate', 'São Paulo|São Paulo FC', 'Palmeiras|SE Palmeiras', 'Grêmio|Grêmio Porto Alegre',
      'Vasco da Gama|Vasco|CR Vasco da Gama', 'Cruzeiro|Cruzeiro EC', 'Vélez Sarsfield|Vélez|CA Vélez Sarsfield',
      'Colo-Colo|Colo Colo', 'Olimpia|Club Olimpia|Olimpia Asunción',
    ]),
    question('africa', 'country', 'Name a country that won a men’s Africa Cup of Nations edition from 1982 through 1998.', [
      'Egypt', 'Nigeria', 'Ghana', 'Cameroon|Cameroun', 'Algeria', 'South Africa',
      'Côte d’Ivoire|Ivory Coast|Cote d Ivoire',
    ]),
    question('asia', 'country', 'Name a host of an AFC Asian Cup edition from 1956 through 1988.', [
      'South Korea|Korea Republic|Republic of Korea', 'Qatar', 'Iran|IR Iran|Islamic Republic of Iran', 'Thailand',
      'Kuwait', 'Singapore', 'Israel', 'Hong Kong|Hong Kong China',
    ]),
    question('worldWomen23', 'country', 'Name a team eliminated in the round of 16 at the 2023 FIFA Women’s World Cup.', [
      'United States|USA|US|United States of America', 'Norway|Norge', 'Switzerland',
      'Denmark|Danmark', 'Morocco', 'Nigeria', 'South Africa', 'Jamaica',
    ]),
    question('women', 'player', 'Name a player who finished as a season top scorer in the UEFA Women’s Champions League, including qualifying and ties, from 2015/16 through 2022/23.', [
      'Alexia Putellas|Putellas|Alexia', 'Ada Hegerberg|Hegerberg', 'Vivianne Miedema|Miedema',
      'Pernille Harder|Harder', 'Jenni Hermoso|Hermoso|Jennifer Hermoso', 'Fran Kirby|Kirby|Francesca Kirby',
      'Ewa Pajor|Pajor', 'Zsanett Jakabfi|Jakabfi', 'Berglind Thorvaldsdóttir|Berglind Thorvaldsdottir|Thorvaldsdottir',
      'Emueje Ogbiagbevha|Ogbiagbevha',
    ]),
  ],
];

const day = 86_400_000;
const firstDay = Date.UTC(2026, 10, 12);
const dateKey = (timestamp) => new Date(timestamp).toISOString().slice(0, 10);

export const legacyRounds = calendar.map((entry, index) => ({
  ...(Array.isArray(entry) ? {
    ...openingRound, id: 'wembley-' + String(index + 1).padStart(3, '0'), questions: entry,
  } : entry),
  number: index + 1,
  date: dateKey(firstDay + index * day),
}));

// Each revised question set has its own storage key; existing attempts remain immutable.
export const rounds = legacyRounds.map(round => easyDays[round.date] ? {
  ...round, id:round.id + '-easy-v1', storageKey:round.date + '~easy-v1',
  difficulty:'Easy–medium', questions:easyDays[round.date],
} : round);
export const savedRounds = [...legacyRounds, ...rounds.filter(round => round.storageKey)];
export const roundKey = round => round.storageKey || round.date;

export function selectRound(now = Date.now(), date = null) {
  const dayIndex = Math.floor((now - firstDay) / day);
  const liveIndex = Math.max(0, Math.min(dayIndex, rounds.length - 1));
  const requestedIndex = rounds.findIndex(round => round.date === date);
  const archived = requestedIndex >= 0 && requestedIndex < liveIndex;
  const active = requestedIndex >= 0 && requestedIndex <= liveIndex ? requestedIndex : liveIndex;
  return {
    round: rounds[active],
    archived,
    nextAt: dayIndex < rounds.length - 1 ? firstDay + (Math.max(-1, dayIndex) + 1) * day : null,
  };
}
