import personsData from '@/data/persons.json';
import factionsData from '@/data/factions.json';
import itemsData from '@/data/items.json';
import locationsData from '@/data/locations.json';
import sessionsData from '@/data/sessions.json';

function generateNodes () {
  let persons = personsData.map(p => ({
    id: p.id,
    type: 'person',
    degree: 0,
    name: p.properties.Name.title.map(d => d.plain_text).join('')
  }));

  let factions = factionsData.map(f => ({
    id: f.id,
    type: 'faction',
    degree: 0,
    name: f.properties.Name.title.map(d => d.plain_text).join('')
  })).filter(d => d.name);

  let items = itemsData.map(i => ({
    id: i.id,
    type: 'item',
    degree: 0,
    name: i.properties.Name.title.map(d => d.plain_text).join('')
  })).filter(d => d.name);

  let locations = locationsData.map(l => ({
    id: l.id,
    type: 'location',
    degree: 0,
    name: l.properties.Name.title.map(d => d.plain_text).join('')
  })).filter(d => d.name);

  let sessions = sessionsData
    .map(s => ({
      id: s.id,
      type: 'session',
      name: s.properties?.Name.title.map(d => d.plain_text).join(''),
      degree: 0,
      number: new Number(s.properties.Session?.number || 0).valueOf(),
    }))
    .filter(d => d.name !== '')
  
  const validIDs = new Set(persons.concat(factions, items, locations, sessions).map(n => n.id));

  const links = [];
  const connect = (source, targetType) => target => {
    if (!validIDs.has(source.id) || !validIDs.has(target.id)) return;
    source.degree = (source.degree || 0) + 1;
    target.degree = (target.degree || 0) + 1;
    links.push({
      source: source.id,
      target: target.id,
      sourceType: source.type,
      targetType,
    });
  };

  for (let p in personsData) {
    const { Friends, Faction, Carries } = personsData[p].properties;
    let person = persons[p];
    Friends.relation.forEach(connect(person, 'person'));
    Faction.relation.forEach(connect(person, 'faction'));
    Carries.relation.forEach(connect(person, 'item'));
  }

  for (let l in locationsData) {
    
    const p = locationsData[l].properties;
    p['Items found here'].relation.forEach(connect(locations[l], 'item'));
  }

  for (let i = 0; i < sessionsData.length; i++) {
    const s = sessionsData[i].properties;
    let session = sessions[i];
    if (i < sessionsData.length - 1) connect(session, 'session')(sessionsData[i+1]);
    s['Items revelations'].relation.forEach(connect(session, 'item'));
    s['Locations'].relation.forEach(connect(session, 'location'));
  }
  
  return {
    nodes: persons.concat(factions, items, locations, sessions).filter(d => d.name),
    links
  };
}

export const { nodes, links } = generateNodes();
