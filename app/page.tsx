"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { List } from "react-window";
import { useAsyncList } from "@react-stately/data";
import Image from "next/image";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import GithubIcon from "../assets/GithubIcon.png";
import { Button } from "@heroui/button";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, getKeyValue } from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";

import "@/styles/main.css";

import AllSetsButton from "../assets/AllSetsButton.png";
import SV2aButton from "../assets/151Button.png";
import ParadiseDragonaButton from "../assets/ParadiseDragonaButton.png";
import SuperElectricBreakerButton from "../assets/SuperElectricBreakerButton.png";
import TerastalFestivalButton from "../assets/TerastalFestivalButton.png";
import BattlePartnersButton from "../assets/BattlePartnersButton.png";
import HeatWaveArenaButton from "../assets/HeatWaveArenaButton.png";
import TheGloryOfTeamRocketButton from "../assets/TheGloryOfTeamRocketButton.png";
import BlackBoltButton from "../assets/BlackBoltButton.png";
import WhiteFlareButton from "../assets/WhiteFlareButton.png";
import MegaBraveButton from "../assets/MegaBraveButton.png";
import MegaSymphoniaButton from "../assets/MegaSymphoniaButton.png";


import { Roboto } from 'next/font/google'
import { StringToBoolean } from "tailwind-variants";
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";


const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700'], // pick the weights you need
})

const siteSets = [
  SV2aButton, ParadiseDragonaButton, SuperElectricBreakerButton, TerastalFestivalButton,
  BattlePartnersButton, HeatWaveArenaButton, TheGloryOfTeamRocketButton, BlackBoltButton,
  WhiteFlareButton, MegaBraveButton, MegaSymphoniaButton
]

const tcgColumns = [
  { key: "cardName", label: "Card Name" },
  { key: "cardNumber", label: "Card Number" },
  { key: "cardSet", label: "Card Set" },
  { key: "marketPrice", label: "Market Price" },
  { key: "highestPct", label: "Highest %" },
  { key: "cardrushPct", label: "Cardrush %" },
  { key: "cardrushPrice", label: "Cardrush Price" },
  { key: "cardrushStock", label: "Cardrush Stock" },
  { key: "torecaPct", label: "Toreca %" },
  { key: "torecaPrice", label: "Toreca Price" },
  { key: "torecaStock", label: "Toreca Stock" },
  { key: "hareruyaPct", label: "Hareruya %" },
  { key: "hareruyaPrice", label: "Hareruya Price" },
  { key: "hareruyaStock", label: "Hareruya Stock" },
  // { key: "priceChartingLink", label: "PriceCharting Link" },
  // { key: "cardrushLink", label: "Cardrush Link" },
  // { key: "torecaLink", label: "Toreca Link" },
  // { key: "hareruyaLink", label: "Hareruya Link" },
]

type TCGCard={
  rowIndex: number;
  cardName: string;
  cardNumber: string;
  cardSet: string;
  marketPrice: number;
  highestPct: number;
  cardrushPct: number;
  cardrushPrice: number,
  cardrushStock: number;
  torecaPct: number;
  torecaPrice: number;
  torecaStock: number;
  hareruyaPct: number;
  hareruyaPrice: number;
  hareruyaStock: number;
  priceChartingLink: string;
  cardrushLink: string;
  torecaLink: string;
  hareruyaLink: string;
}

type LastUpdated={
  date: Timestamp
}

type setButton={
  setCode: string;
  imageLocation: string;
  setReleaseDate: string;
}

export default function Home() {

  const [isLoading, setIsLoading] = useState(true);

  // const [data, setData] = useState<TCGCard[]>([]);
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 20;

  const [selectedSets, setSelectedSets] = useState<string[]>([]);

  const [lastUpdated, setLastUpdated] = useState("");
  const formattedDate = lastUpdated
    ? new Intl.DateTimeFormat('en-US', {
        dateStyle: "full",
        timeStyle: "long"
      }).format(new Date(lastUpdated))
    : "";

  useEffect(() => {
    fetch(
      'https://pokemonwebscraperapi.robertliao.ca/last_updated'
      // 'https://localhost:7117/last_updated'
    )
      .then((response) => response.json())
      .then((data) => {
        setLastUpdated(data.lastUpdated)
        console.log("Fetched Data", data.lastUpdated);
        
      })
      .catch((error) => console.error('Error fetching data:', error));
      console.log("Test", lastUpdated);
  }, [])

  const list = useAsyncList<TCGCard>({
    async load({ signal }) {
      // signal can be used to cancel fetch if component unmounts
      const res = await fetch(
        "https://pokemonwebscraperapi.robertliao.ca/cards"
        // "https://localhost:7117/cards"
        , { signal }
      );
      const data: TCGCard[] = await res.json();

      for (let i = 0; i < data.length; i++) {
        selectedSets.push(data[i].cardSet);
        console.log("Selected Sets:", selectedSets);
      }

      setIsLoading(false);

      return { items: data }; // must return { items: [...] }
    },
    async sort({ items, sortDescriptor }) {
      setPage(1); // Reset to first page when sorting
      const sorted = [...items].sort((a, b) => {
        const first = a[sortDescriptor.column as keyof TCGCard];
        const second = b[sortDescriptor.column as keyof TCGCard];
        let cmp = 0;

        if (first != null && second != null) {
          if (typeof first === 'string') {
            cmp = first.localeCompare(second as string);
          } else if (typeof first === 'number') {
            cmp = first - (second as number);
          }
        }

        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });

      return {
        items: sorted
      };
    }
  });
  const [imageImports, setImageImports] = useState<{ [key: string]: any }>({});

  const renderedSetList = []

  const setList = useAsyncList<setButton>({
    async load({ signal }) {
      // signal can be used to cancel fetch if component unmounts
      const res = await fetch(
        "https://pokemonwebscraperapi.robertliao.ca/all_sets"
        // "https://localhost:7117/all_sets"
        , { signal }
      );
      const data: setButton[] = await res.json();
      return { items: data }; // must return { items: [...] }
    },
  });

  for (let i = 0 ; i < setList.items.length ; i++) {
    // console.log(setList.items[i].setCode, setList.items[i].imageLocation, setList.items[i].setReleaseDate);


    renderedSetList.push(
      <div 
        key={i} 
        className={`setButton ${selectedSets.includes(setList.items[i].setCode) ? 'selected' : ''}`}
        onClick={() => {
          const setCode = setList.items[i].setCode;
          setSelectedSets(prev => {
            const newSelection = prev.includes(setCode)
              ? prev.filter(code => code !== setCode)
              : [...prev, setCode];
            setPage(1);
            return newSelection;
          });
        }}
      >
        <img src={imageImports[setList.items[i].imageLocation]?.src} alt="Button" className="setImg"/>
      </div>
    );
  }

  useEffect(() => {
    const loadImages = async () => {
      const imports: { [key: string]: any } = {};
      for (const item of setList.items) {
        const imageName = item.imageLocation.split('/').pop()?.split('.')[0];
        try {
          const imageModule = await import(`../assets/${imageName}.png`);
          imports[item.imageLocation] = imageModule.default;
        } catch (error) {
          console.error(`Failed to load image: ${imageName}`, error);
        }
      }
      setImageImports(imports);
    };

    if (setList.items.length > 0) {
      loadImages();
    }
  }, [setList.items]);

  const filteredItems = React.useMemo(() => {
    if (selectedSets.length === 0) return list.items;
    return list.items.filter(card => selectedSets.includes(card.cardSet));
  }, [list.items, selectedSets]);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);



  return (
    <section>
      <div className="mainSection">

        <div>
          <h1 className="websiteTitle roboto">Japanese Pokemon Web Scraper</h1>
        </div>

        {/* <div className="buttonSection">
          {siteSets.map((set, index) => 
            (
              <img src={set.src} alt="Button" className="setButton" key={index}/>
            ))
          }
        </div> */}
        
        <div>
          <div className="allButtonSection">
            <img 
              src={AllSetsButton.src} 
              alt="All sets button" 
              className={`allSetsButton ${selectedSets.length < setList.items.length ? '' : 'selected' }`}
              onClick={() => {
                if(selectedSets.length < setList.items.length) {
                  const allSetCodes = setList.items.map(set => set.setCode);
                  setSelectedSets(allSetCodes);
                } else {
                  setSelectedSets([]);
                }
                setPage(1);
              }}
            />
          </div>
          
          <div className="buttonSection">
            {renderedSetList}
          </div>
        </div>

      </div>

      <div className="tableSection">
        {/* <Table aria-label="Example table with dynamic content">

          <TableHeader columns={tcgColumns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={data}>
            {(item) => (
              <TableRow key={item.rowIndex}>
                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>

        </Table> */}

        {isLoading && 
        <div className="loadingIcon">
          <Spinner classNames={{label: "text-foreground mt-4"}} variant="wave" size="lg" />
        </div>
        }

        {!isLoading && 
        <Table
          className="tcgTable"
          aria-label="Example table with dynamic content"
          selectionMode="single"
          sortDescriptor={list.sortDescriptor}
          onSortChange={list.sort}
          isHeaderSticky={true}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
        >
          <TableHeader columns={tcgColumns}>
            {(column) => 
              <TableColumn key={column.key} allowsSorting>
                {column.label}
              </TableColumn>
            }
          </TableHeader>

          <TableBody items={items}>
            {(item) => (
              <TableRow key={item.rowIndex}>
                {(columnKey) => {
                  const value = getKeyValue(item, columnKey);
                  let cellClassName = 'defaultCell';
                  let cellBackgroundClassName = '';

                  let isJapanesePrice = false;
                  
                  // Check column type and assign appropriate class
                  if (columnKey.toString().includes('Pct')) {
                    if (value === item.highestPct) {
                      cellClassName = 'percentMatchCell';
                    } else {
                      cellClassName = 'percentageCell';
                    }
                  } else if (columnKey.toString().includes('Price')) {
                    cellClassName = 'priceCell';
                  } else if (columnKey.toString().includes('Stock')) {
                    if(value === 0) {
                      cellClassName = 'noStockCell';
                    } else {
                      cellClassName = 'inStockCell';
                    }
                    // cellClassName = 'stockCell';
                  } else if (columnKey.toString().includes('Link')) {
                    cellClassName = 'linkCell';
                  }

                  if (columnKey.toString().includes('cardrush')) {
                    cellBackgroundClassName = 'cardRushCell';
                  } else if (columnKey.toString().includes('toreca')) {
                    cellBackgroundClassName = 'torecaCell';
                  } else if (columnKey.toString().includes('hareruya')) {
                    cellBackgroundClassName = 'hareruyaCell';
                  } else if (columnKey.toString().includes('marketPrice') || columnKey.toString().includes('highestPct')) {
                    cellBackgroundClassName = 'priceChartingCell';
                  }

                  if(columnKey.toString().includes('cardrush')) {
                    if(columnKey.toString().includes('Price')) {
                      return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.cardrushLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey)}円</a></TableCell>
                    }
                    return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.cardrushLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey)}</a></TableCell>
                  }
                  else if(columnKey.toString().includes('toreca')) {
                    if(columnKey.toString().includes('Price')) {
                      return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.torecaLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey)}円</a></TableCell>
                    }
                    return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.torecaLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey)}</a></TableCell>
                  }
                  else if(columnKey.toString().includes('hareruya')) {
                    if(columnKey.toString().includes('Price')) {
                      return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.hareruyaLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey)}円</a></TableCell>
                    }
                    return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.hareruyaLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey)}</a></TableCell>
                  }
                  else if(columnKey.toString().includes('marketPrice') || columnKey.toString().includes('highestPct') ) {
                    if(columnKey.toString().includes('marketPrice')) {
                      return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.priceChartingLink} target="_blank" rel="noopener noreferrer">${getKeyValue(item, columnKey).toFixed(2)}</a></TableCell>
                    }
                    return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}><a href={item.priceChartingLink} target="_blank" rel="noopener noreferrer">{getKeyValue(item, columnKey).toFixed(2)}</a></TableCell>
                  }

                  return <TableCell className={[cellClassName, cellBackgroundClassName].join(" ")}>{getKeyValue(item, columnKey)}</TableCell>
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
        }
        
      </div>

      <div className="footerSection roboto">
        {/* Last Updated: {new Date(lastUpdated.date * 1000).toLocaleString()} */}
        <div>
          <p>All Prices in CAD $ | Created By Rob L/S3</p>
        </div>

        <br />

        <div>
          <p>Last Updated: {formattedDate}</p>
        </div>

        <a href="https://github.com/Swomp03/Pokemon-Web-Scraper-Frontend" target="_blank">
          <img src={GithubIcon.src} className="githubIcon" alt="Github Icon" />
        </a>
      </div>
    </section>
  );
}
