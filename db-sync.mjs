import dotenv from 'dotenv';
import { Client } from '@notionhq/client';
import { promises as fs } from 'fs';

dotenv.config();
const dir = 'src/data/';
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const dbs = [
  {
    name: 'persons',
    id: '27fc1512f1dd414cbbbc0a77d6931f08',
  },
  {
    name: 'factions',
    id: 'b88cf9b5c141448a9c8a8a2153ac5e87',
  },
  {
    name: 'sessions',
    id: 'aed7602fc4cc4f3a9a40cb30eacb8760',
  },
  {
    name: 'locations',
    id: '0441889adfe345b0ab6373be6ab17ca6',
  },
  {
    name: 'items',
    id: 'd2bd1ccaeffc4c90abf5d1772e6bde47',
  },
  {
    name: 'creatures',
    id: '36fa0bddf9a946ef9c6527fea0fd186c',
  }
];

async function sync ({ name, id }) {
  const response = await notion.databases.query({ database_id: id });
  fs.writeFile(`${dir}/${name}.json`, JSON.stringify(response.results));
}

dbs.forEach(sync);