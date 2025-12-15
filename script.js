
// Open AI API

window.OPENAI_API_KEY = "Add ypur OpenAI API KEY here";

// Board Game Geek API Token - Paid API. Not running

window.BGG_API_TOKEN = null;

function getOpenAIKey() {
  return window.OPENAI_API_KEY || localStorage.getItem("openai_api_key") || null;
}

function getBGGToken() {
  return window.BGG_API_TOKEN || localStorage.getItem("bgg_api_token") || null;
}


// Board Game Geek XML API Integration

async function searchBGGGames(query) {
  const token = getBGGToken();
  if (!token) {
    console.log("No BGG API token set - using local database");
    return null;
  }

  try {
    const response = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "GameMeet/1.0"
      }
    });

    if (!response.ok) {
      console.error("BGG API error:", response.status);
      return null;
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const items = xmlDoc.querySelectorAll("item");

    const results = [];
    for (let i = 0; i < Math.min(items.length, 6); i++) {
      const item = items[i];
      const id = item.getAttribute("id");
      const name = item.querySelector("name")?.getAttribute("value") || "Unknown";
      const yearPublished = item.querySelector("yearpublished")?.getAttribute("value") || "";

      results.push({
        id: id,
        name: name,
        year_published: yearPublished,
        thumb_url: `https://cf.geekdo-images.com/thumb/img/${id}`,
        image_url: `https://cf.geekdo-images.com/original/img/${id}`
      });
    }

    return results;
  } catch (err) {
    console.error("BGG API fetch error:", err);
    return null;
  }
}

async function getBGGGameDetails(gameId) {
  const token = getBGGToken();
  if (!token) return null;

  try {
    const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&stats=1`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "User-Agent": "GameMeet/1.0"
      }
    });

    if (!response.ok) return null;

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const item = xmlDoc.querySelector("item");

    if (!item) return null;

    const name = item.querySelector("name[type='primary']")?.getAttribute("value") || "Unknown";
    const description = item.querySelector("description")?.textContent || "";
    const thumbnail = item.querySelector("thumbnail")?.textContent || "";
    const image = item.querySelector("image")?.textContent || "";
    const minPlayers = item.querySelector("minplayers")?.getAttribute("value") || "";
    const maxPlayers = item.querySelector("maxplayers")?.getAttribute("value") || "";
    const yearPublished = item.querySelector("yearpublished")?.getAttribute("value") || "";

    return {
      id: gameId,
      name: name,
      description: description.replace(/&#10;/g, "\n").substring(0, 300),
      thumb_url: thumbnail,
      image_url: image,
      min_players: minPlayers,
      max_players: maxPlayers,
      year_published: yearPublished
    };
  } catch (err) {
    console.error("BGG game details error:", err);
    return null;
  }
}


if (!window.__GAMEMEET_INIT__) {
  window.__GAMEMEET_INIT__ = true;

  document.addEventListener("DOMContentLoaded", () => {
   
    // Local "DB" (board games)
   
    const BOARD_GAMES_DB = [ 
      { id: "1", name: "Catan", thumb_url: "https://upload.wikimedia.org/wikipedia/en/a/a3/Catan-2015-boxart.jpg", image_url: "https://upload.wikimedia.org/wikipedia/en/a/a3/Catan-2015-boxart.jpg", description: "Collect and trade resources to build settlements, cities and roads in this classic strategy game.", min_players: "3", max_players: "4", year_published: "1995" },
      { id: "2", name: "Ticket to Ride", thumb_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhbDzcoOb00gUqY7-zscHvJXjm-DlXJEOw_Q&s", image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhbDzcoOb00gUqY7-zscHvJXjm-DlXJEOw_Q&s", description: "Build train routes across the country and complete destination tickets for points.", min_players: "2", max_players: "5", year_published: "2004" },
      { id: "3", name: "Pandemic", thumb_url: "https://upload.wikimedia.org/wikipedia/en/3/36/Pandemic_game.jpg", image_url: "https://upload.wikimedia.org/wikipedia/en/3/36/Pandemic_game.jpg", description: "Work together to stop global disease outbreaks in this cooperative strategy game.", min_players: "2", max_players: "4", year_published: "2008" },
      { id: "4", name: "Codenames", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboardgamewikia.com%2Fblog%2Fwp-content%2Fuploads%2F2022%2F12%2Fcodenames-2015-board-game-cover.webp&f=1&nofb=1&ipt=816865cb29fcb5c93f268b75ddf7509f538caf2dd54a07e1a669b56de8b25ba7", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboardgamewikia.com%2Fblog%2Fwp-content%2Fuploads%2F2022%2F12%2Fcodenames-2015-board-game-cover.webp&f=1&nofb=1&ipt=816865cb29fcb5c93f268b75ddf7509f538caf2dd54a07e1a669b56de8b25ba7", description: "Give one-word clues to help your team guess words on the board in this party game.", min_players: "2", max_players: "8", year_published: "2015" },
      { id: "5", name: "Azul", thumb_url: "https://upload.wikimedia.org/wikipedia/en/2/23/Picture_of_Azul_game_box.jpg", image_url: "https://upload.wikimedia.org/wikipedia/en/2/23/Picture_of_Azul_game_box.jpg", description: "Draft colorful tiles and create beautiful mosaic patterns in this abstract strategy game.", min_players: "2", max_players: "4", year_published: "2017" },
      { id: "6", name: "Wingspan", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.mobygames.com%2Fcovers%2F9764895-wingspan-nintendo-switch-front-cover.jpg&f=1&nofb=1&ipt=d94b738fdb0bc6af85b511627b7faae60b608ba85c76267e0f5b0b7c774aef1a", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn.mobygames.com%2Fcovers%2F9764895-wingspan-nintendo-switch-front-cover.jpg&f=1&nofb=1&ipt=d94b738fdb0bc6af85b511627b7faae60b608ba85c76267e0f5b0b7c774aef1a", description: "Attract birds to your wildlife preserve in this beautiful engine-building card game.", min_players: "1", max_players: "5", year_published: "2019" },
      { id: "7", name: "7 Wonders", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.boardgamequest.com%2Fwp-content%2Fuploads%2F2012%2F09%2F7-wonders-cover.jpg&f=1&nofb=1&ipt=ca16dd9d0ad675285471b3ca598b9333c53062792e2b3047a0bf8805501b2be0", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.boardgamequest.com%2Fwp-content%2Fuploads%2F2012%2F09%2F7-wonders-cover.jpg&f=1&nofb=1&ipt=ca16dd9d0ad675285471b3ca598b9333c53062792e2b3047a0bf8805501b2be0", description: "Build an ancient civilization and construct architectural wonders in this card drafting game.", min_players: "2", max_players: "7", year_published: "2010" },
      { id: "8", name: "Splendor", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.boardgamequest.com%2Fwp-content%2Fuploads%2F2014%2F11%2FSplendor.jpg&f=1&nofb=1&ipt=a1a2fe7f168c5aa2ee2669adc4981ab58edb81731404ba6339ecc88c5559be6a", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.boardgamequest.com%2Fwp-content%2Fuploads%2F2014%2F11%2FSplendor.jpg&f=1&nofb=1&ipt=a1a2fe7f168c5aa2ee2669adc4981ab58edb81731404ba6339ecc88c5559be6a", description: "Collect gems and develop your merchant empire in this elegant engine-building game.", min_players: "2", max_players: "4", year_published: "2014" },
      { id: "9", name: "Dominion", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbgomedia-19127.kxcdn.com%2Fimage%2Fproduct%2Fsource%2FGJEzN2qoGKf9D9gAn2qw&f=1&nofb=1&ipt=c5de193a571ae997f4cb4efab78d0ed69de69d8aeef2e14f22128f4cb3448801", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbgomedia-19127.kxcdn.com%2Fimage%2Fproduct%2Fsource%2FGJEzN2qoGKf9D9gAn2qw&f=1&nofb=1&ipt=c5de193a571ae997f4cb4efab78d0ed69de69d8aeef2e14f22128f4cb3448801", description: "Build your kingdom by adding cards to your deck in this pioneering deck-building game.", min_players: "2", max_players: "4", year_published: "2008" },
      { id: "10", name: "Carcassonne", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.kjwrede.de%2Fpresse%2Fwp-content%2Fuploads%2F2015%2F04%2Fcarcassonne_cover_DE-1200x1746.jpg&f=1&nofb=1&ipt=dac396f26c7ffc7499f198c39ea8f540e9b989f8ac0f914624244476846bfc22", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.kjwrede.de%2Fpresse%2Fwp-content%2Fuploads%2F2015%2F04%2Fcarcassonne_cover_DE-1200x1746.jpg&f=1&nofb=1&ipt=dac396f26c7ffc7499f198c39ea8f540e9b989f8ac0f914624244476846bfc22", description: "Build the medieval landscape of Carcassonne by placing tiles and claiming features.", min_players: "2", max_players: "5", year_published: "2000" },
      { id: "11", name: "Gloomhaven", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcf.geekdo-images.com%2FsZYp_3BTDGjh2unaZfZmuA__original%2Fimg%2F7d-lj5Gd1e8PFnD97LYFah2c45M%3D%2F0x0%2Ffilters%3Aformat(jpeg)%2Fpic2437871.jpg&f=1&nofb=1&ipt=965c7fd3ff1039a8de7d6d7c8d6c927d8cbfdc5cb05a5ebab0dfe700ae69264d", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcf.geekdo-images.com%2FsZYp_3BTDGjh2unaZfZmuA__original%2Fimg%2F7d-lj5Gd1e8PFnD97LYFah2c45M%3D%2F0x0%2Ffilters%3Aformat(jpeg)%2Fpic2437871.jpg&f=1&nofb=1&ipt=965c7fd3ff1039a8de7d6d7c8d6c927d8cbfdc5cb05a5ebab0dfe700ae69264d", description: "Explore dungeons and complete quests in this epic tactical combat campaign game.", min_players: "1", max_players: "4", year_published: "2017" },
      { id: "12", name: "Scythe", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboardgamewikia.com%2Fblog%2Fwp-content%2Fuploads%2F2022%2F11%2Fscythe-board-game-cover.webp&f=1&nofb=1&ipt=5b935cbae1b6024529b1199e84c2683c125cc51ce91ea1deb28fc38e26cee774", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboardgamewikia.com%2Fblog%2Fwp-content%2Fuploads%2F2022%2F11%2Fscythe-board-game-cover.webp&f=1&nofb=1&ipt=5b935cbae1b6024529b1199e84c2683c125cc51ce91ea1deb28fc38e26cee774", description: "Lead your faction to victory in an alternate-history 1920s Europa with mechs.", min_players: "1", max_players: "5", year_published: "2016" },
      { id: "13", name: "Terraforming Mars", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.j3zM1tNcwrtaP_Z7k_fM-wHaHa%3Fpid%3DApi&f=1&ipt=f7f017f79ad253f6b3e7958dea3dba9de96828b99214d102209f991019146452&ipo=images", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.j3zM1tNcwrtaP_Z7k_fM-wHaHa%3Fpid%3DApi&f=1&ipt=f7f017f79ad253f6b3e7958dea3dba9de96828b99214d102209f991019146452&ipo=images", description: "Compete to make Mars habitable while building your corporation's economy.", min_players: "1", max_players: "5", year_published: "2016" },
      { id: "14", name: "Spirit Island", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.2XHfx9gVjLtt3lIGyubIZwHaHa%3Fpid%3DApi&f=1&ipt=8c65946a62df3bfb8c7e7c890b7fc7e3547e0d9eaff0c22cd42dd41ec4d4e2f6&ipo=images", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.2XHfx9gVjLtt3lIGyubIZwHaHa%3Fpid%3DApi&f=1&ipt=8c65946a62df3bfb8c7e7c890b7fc7e3547e0d9eaff0c22cd42dd41ec4d4e2f6&ipo=images", description: "Play as spirits defending your island from colonizing invaders in this cooperative game.", min_players: "1", max_players: "4", year_published: "2017" },
      { id: "15", name: "Root", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.Jg2I5TkJd-t3MCRAK46BTwHaHa%3Fpid%3DApi&f=1&ipt=b2cbc61bcbd1ad5a5bc61cbf356d21e2f71500584c27772c32dad3d00429eb7d&ipo=images", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.Jg2I5TkJd-t3MCRAK46BTwHaHa%3Fpid%3DApi&f=1&ipt=b2cbc61bcbd1ad5a5bc61cbf356d21e2f71500584c27772c32dad3d00429eb7d&ipo=images", description: "Asymmetric woodland warfare where different factions battle for control of the forest.", min_players: "2", max_players: "4", year_published: "2018" },
      { id: "16", name: "Everdell", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.mobygames.com%2Fimages%2Fcovers%2Fl%2F839661-everdell-nintendo-switch-front-cover.jpg&f=1&nofb=1&ipt=dc372e1bf9c54e64294938c9290a25eeae665c5b97b3d3efa070aaa4aaa78a74", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.mobygames.com%2Fimages%2Fcovers%2Fl%2F839661-everdell-nintendo-switch-front-cover.jpg&f=1&nofb=1&ipt=dc372e1bf9c54e64294938c9290a25eeae665c5b97b3d3efa070aaa4aaa78a74", description: "Build a city of critters and constructions in this charming worker placement game.", min_players: "1", max_players: "4", year_published: "2018" },
      { id: "17", name: "Betrayal at House on the Hill", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F81rR1fZXQRL._AC_SL1500_.jpg&f=1&nofb=1&ipt=43f3a3ddb7724d3c02f77d15676177aaf1b27db501fdaf88c70ab365b668010c", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FI%2F81rR1fZXQRL._AC_SL1500_.jpg&f=1&nofb=1&ipt=43f3a3ddb7724d3c02f77d15676177aaf1b27db501fdaf88c70ab365b668010c", description: "Explore a haunted mansion until a traitor is revealed in this horror adventure game.", min_players: "3", max_players: "6", year_published: "2004" },
      { id: "18", name: "Dixit", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcf.geekdo-images.com%2FJ0PlHArkZDJ57H-brXW2Fw__original%2Fimg%2Fjt3kFCHJ3HJ2079dMLwipFZqdQg%3D%2F0x0%2Ffilters%3Aformat(jpeg)%2Fpic6738336.jpg&f=1&nofb=1&ipt=58fb58d27b6f1ec0df7bdcf0d3dda3d0c578f227b898c3d8b6d2cdc89479b876", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcf.geekdo-images.com%2FJ0PlHArkZDJ57H-brXW2Fw__original%2Fimg%2Fjt3kFCHJ3HJ2079dMLwipFZqdQg%3D%2F0x0%2Ffilters%3Aformat(jpeg)%2Fpic6738336.jpg&f=1&nofb=1&ipt=58fb58d27b6f1ec0df7bdcf0d3dda3d0c578f227b898c3d8b6d2cdc89479b876", description: "Use beautiful artwork and creative clues in this imaginative storytelling party game.", min_players: "3", max_players: "6", year_published: "2008" },
      { id: "19", name: "King of Tokyo", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdown-ph.img.susercontent.com%2Ffile%2F1ee4190ac0055ed1b084f7426dffdb38&f=1&nofb=1&ipt=3f4ec5b41533332102b7b247a99bd1239e7055c7cc3451528ad9011cccc39e9c", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fdown-ph.img.susercontent.com%2Ffile%2F1ee4190ac0055ed1b084f7426dffdb38&f=1&nofb=1&ipt=3f4ec5b41533332102b7b247a99bd1239e7055c7cc3451528ad9011cccc39e9c", description: "Giant monsters battle for control of Tokyo in this dice-rolling mayhem game.", min_players: "2", max_players: "6", year_published: "2011" },
      { id: "20", name: "Uno", thumb_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.cnn.com%2Fapi%2Fv1%2Fimages%2Fstellar%2Fprod%2Fgettyimages-1577650146.jpg%3Fq%3Dw_2000%2Cc_fill&f=1&nofb=1&ipt=71c618379dc83dfc3412929edafe73c237a2cd49b89fed38e2b8c96f4b9ac728", image_url: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.cnn.com%2Fapi%2Fv1%2Fimages%2Fstellar%2Fprod%2Fgettyimages-1577650146.jpg%3Fq%3Dw_2000%2Cc_fill&f=1&nofb=1&ipt=71c618379dc83dfc3412929edafe73c237a2cd49b89fed38e2b8c96f4b9ac728", description: "Match colors and numbers to be the first to empty your hand in this classic card game.", min_players: "2", max_players: "10", year_published: "1971" }
    ];

   
    // Sample sessions 
   
    const SAMPLE_SESSIONS = [
      { id: 100, title: "Catan Championship", game: "Catan", type: "Board", date: "2025-12-15", time: "19:00", location: "Oslo", description: "Competitive Catan tournament with prizes! Looking for experienced players.", cover: "https://upload.wikimedia.org/wikipedia/en/a/a3/Catan-2015-boxart.jpg" },
      { id: 101, title: "Weekly Pandemic Night", game: "Pandemic", type: "Board", date: "2025-12-12", time: "18:30", location: "Online", description: "Casual co-op session. New players welcome! We'll explain the rules.", cover: "https://upload.wikimedia.org/wikipedia/en/3/36/Pandemic_game.jpg" },
      { id: 102, title: "Ticket to Ride: Europe", game: "Ticket to Ride", type: "Board", date: "2025-12-18", time: "20:00", location: "Bergen", description: "Racing across Europe! All skill levels welcome.", cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhbDzcoOb00gUqY7-zscHvJXjm-DlXJEOw_Q&s" },
      { id: 103, title: "Codenames Squad", game: "Codenames", type: "Card", date: "2025-12-14", time: "19:00", location: "Stavanger", description: "Party game night! Teams of 4. Bring your best game.", cover: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fboardgamewikia.com%2Fblog%2Fwp-content%2Fuploads%2F2022%2F12%2Fcodenames-2015-board-game-cover.webp&f=1&nofb=1&ipt=816865cb29fcb5c93f268b75ddf7509f538caf2dd54a07e1a669b56de8b25ba7" },
      { id: 104, title: "Gloomhaven Campaign", game: "Gloomhaven", type: "RPG", date: "2025-12-16", time: "18:00", location: "Trondheim", description: "Continuing our campaign! Episode 7. Members only.", cover: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcf.geekdo-images.com%2FsZYp_3BTDGjh2unaZfZmuA__original%2Fimg%2F7d-lj5Gd1e8PFnD97LYFah2c45M%3D%2F0x0%2Ffilters%3Aformat(jpeg)%2Fpic2437871.jpg&f=1&nofb=1&ipt=965c7fd3ff1039a8de7d6d7c8d6c927d8cbfdc5cb05a5ebab0dfe700ae69264d" },
      { id: 105, title: "Azul Tournament", game: "Azul", type: "Board", date: "2025-12-13", time: "17:00", location: "Kristiansand", description: "Quick games, fast-paced action. Entry fee $5.", cover: "https://upload.wikimedia.org/wikipedia/en/2/23/Picture_of_Azul_game_box.jpg" }
    ];
    const SAMPLE_IDS = SAMPLE_SESSIONS.map(s => s.id);

 
    // DOM Selectors
 
    const sessionListEl = document.getElementById("sessionList");

    // create page selectors
    const createForm = document.getElementById("createSessionForm");
    const gameSearchInput = document.getElementById("gameSearch");
    const gameResults = document.getElementById("gameResults");
    const gamePreview = document.getElementById("gamePreview");
    let selectedGameCover = "";
    let selectedGameData = null;

    // assistant selectors
    const assistantBtn = document.getElementById("assistantBtn");
    const assistantPopup = document.getElementById("assistantPopup");
    const closeAssistant = document.getElementById("closeAssistant");
    const assistantSend = document.getElementById("assistantSend");
    const assistantInput = document.getElementById("assistantInput");
    const assistantMessages = document.getElementById("assistantMessages");
    const aiDescriptionBtn = document.getElementById("aiDescriptionBtn");

    // profile
    const joinedSessionsContainer = document.getElementById("joinedSessions");

    // modal
    const modal = document.getElementById("sessionModal");
    const modalCloseBtn = document.querySelector(".modal-close");
    let currentSession = null;


    // Storage helpers

    function loadStoredSessions() {
      return JSON.parse(localStorage.getItem("sessions")) || [];
    }
    function saveStoredSessions(sessions) {
      localStorage.setItem("sessions", JSON.stringify(sessions));
    }
    function loadJoinedSessions() {
      return JSON.parse(localStorage.getItem("joinedSessions")) || [];
    }
    function saveJoinedSessions(joined) {
      localStorage.setItem("joinedSessions", JSON.stringify(joined));
    }


    // Sessions composition

    function getAllSessions() {

      const stored = loadStoredSessions();
      const filtered = stored.filter(s => !SAMPLE_IDS.includes(s.id));
      return [...SAMPLE_SESSIONS, ...filtered];
    }

    function isUserCreated(session) {
      return !SAMPLE_IDS.includes(session.id);
    }


    // Rendering sessions

    function clearSessionList() {
      if (!sessionListEl) return;
      sessionListEl.innerHTML = "";
    }

    function renderSessions(sessions) {
      if (!sessionListEl) return;
      clearSessionList();

      if (!sessions || sessions.length === 0) {
        sessionListEl.innerHTML = "<p class='no-sessions'>No sessions found. <a href='create.html'>Create one!</a></p>";
        return;
      }

      sessions.forEach(s => {
        const card = document.createElement("div");
        card.className = "session-card";
        const deleteBtnHtml = isUserCreated(s) ? `<button class="delete-session-btn" data-id="${s.id}" title="Delete session">✕</button>` : "";
        card.innerHTML = `
          <div class="session-card-image">
            ${deleteBtnHtml}
            <img src="${s.cover || 'https://via.placeholder.com/300x200?text=Game+Session'}" alt="${s.game} session" />
            <span class="session-type-badge">${s.type}</span>
          </div>
          <div class="session-card-content">
            <h3>${escapeHtml(s.title)}</h3>
            <p class="session-game"><strong>${escapeHtml(s.game)}</strong></p>
            <p class="session-meta"><span class="meta-label">📅 Date:</span> ${escapeHtml(s.date)}</p>
            <p class="session-meta"><span class="meta-label">🕐 Time:</span> ${escapeHtml(s.time)}</p>
            <p class="session-meta"><span class="meta-label">📍 Location:</span> ${escapeHtml(s.location)}</p>
            <p class="session-description">${escapeHtml(s.description)}</p>
          </div>
        `;

        // open modal on card click
        card.addEventListener("click", (e) => {
          // if delete button is clicked, prevent opening modal
          if (e.target.closest(".delete-session-btn")) return;
          openSessionModal(s);
        });

        // wire delete button if present
        const delBtn = card.querySelector(".delete-session-btn");
        if (delBtn) {
          delBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            deleteSession(s.id);
          });
        }

        sessionListEl.appendChild(card);
      });
    }


    // Simple escape helper for text injection

    function escapeHtml(text) {
      if (!text && text !== 0) return "";
      return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }


    // Delete session

    function deleteSession(id) {
      if (!confirm("Are you sure you want to delete this session?")) return;
      let stored = loadStoredSessions();
      stored = stored.filter(s => s.id !== id);
      saveStoredSessions(stored);
      // Re-render current view
      if (typeof currentFilterAndRender === "function") currentFilterAndRender();
      else renderSessions(getAllSessions());
    }


    // Modal: open/close/join logic

    function openSessionModal(session) {
      currentSession = session;
      const img = document.getElementById("modalImage");
      if (img) img.src = session.cover || "";
      const title = document.getElementById("modalTitle");
      if (title) title.textContent = session.title || "";
      const game = document.getElementById("modalGame");
      if (game) game.textContent = `🎮 Game: ${session.game || ""}`;
      const date = document.getElementById("modalDate");
      if (date) date.textContent = `📅 Date: ${session.date || ""}`;
      const time = document.getElementById("modalTime");
      if (time) time.textContent = `🕐 Time: ${session.time || ""}`;
      const location = document.getElementById("modalLocation");
      if (location) location.textContent = `📍 Location: ${session.location || ""}`;
      const desc = document.getElementById("modalDescription");
      if (desc) desc.textContent = session.description || "";

      const joinBtn = document.getElementById("modalJoinBtn");
      if (joinBtn) {
        const joined = loadJoinedSessions();
        const isJoined = joined.find(j => j.id === session.id);
        joinBtn.textContent = isJoined ? "Leave Session" : "Join Session";
      }

      if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
      }
    }

    if (modal && modalCloseBtn) {
      modalCloseBtn.addEventListener("click", () => {
        modal.classList.add("hidden");
        modal.style.display = "none";
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("hidden");
          modal.style.display = "none";
        }
      });
    }

    const modalJoinBtn = document.getElementById("modalJoinBtn");
    if (modalJoinBtn) {
      modalJoinBtn.addEventListener("click", () => {
        if (!currentSession) return;
        let joined = loadJoinedSessions();
        const idx = joined.findIndex(j => j.id === currentSession.id);
        if (idx > -1) {
          joined.splice(idx, 1);
          modalJoinBtn.textContent = "Join Session";
        } else {
          joined.push(currentSession);
          modalJoinBtn.textContent = "Leave Session";
        }
        saveJoinedSessions(joined);
        // update joined list on profile page if visible
        renderJoinedSessions();
      });
    }


    // Search & Filter

    const searchInput = document.getElementById("searchInput");
    const filterType = document.getElementById("filterType");
    const filterLocation = document.getElementById("filterLocation");
    const filterDate = document.getElementById("filterDate");

    // keep a reference so deleteSession can call it after removing an item

    let currentFilterAndRender = null;

    function filterAndRender() {
      currentFilterAndRender = filterAndRender; 
      const sessions = getAllSessions();
      const q = searchInput ? searchInput.value.toLowerCase() : "";
      const type = filterType ? filterType.value : "all";
      const location = filterLocation ? filterLocation.value : "all";
      const date = filterDate ? filterDate.value : "";

      const filtered = sessions.filter(s => {
        const matchesQuery = (s.title || "").toLowerCase().includes(q) || (s.game || "").toLowerCase().includes(q);
        const matchesType = type === "all" || (s.type === type);
        const matchesLocation = location === "all" || (s.location || "").toLowerCase() === location.toLowerCase();
        const matchesDate = !date || (s.date === date);
        return matchesQuery && matchesType && matchesLocation && matchesDate;
      });

      renderSessions(filtered);
    }

    if (searchInput) searchInput.addEventListener("input", filterAndRender);
    if (filterType) filterType.addEventListener("change", filterAndRender);
    if (filterLocation) filterLocation.addEventListener("change", filterAndRender);
    if (filterDate) filterDate.addEventListener("change", filterAndRender);

    // Create form handler (create.html)

    if (createForm) {
      createForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const session = {
          id: Date.now(),
          title: document.getElementById("title").value,
          game: (gameSearchInput && gameSearchInput.value) || "Custom Game",
          type: document.getElementById("gameType").value,
          date: document.getElementById("date").value,
          time: document.getElementById("time").value,
          location: document.getElementById("location").value,
          players: document.getElementById("players").value,
          description: document.getElementById("description").value,
          cover: selectedGameCover || "https://via.placeholder.com/150?text=Game+Cover",
          gameData: selectedGameData
        };
        const sessions = loadStoredSessions();
        sessions.push(session);
        saveStoredSessions(sessions);
        alert("Session created!");
        window.location.href = "index.html";
      });
    }


    // Game search on create page

    let debounceTimer;
    function searchGames(query) {
      if (!query) return [];
      query = query.toLowerCase();
      return BOARD_GAMES_DB.filter(g => g.name.toLowerCase().includes(query)).slice(0, 6);
    }
    function selectGame(game) {
      if (!gameSearchInput) return;
      gameSearchInput.value = game.name;
      selectedGameCover = game.image_url || game.thumb_url || "";
      selectedGameData = game;
      gameResults.classList.add("hidden");
      if (gamePreview && selectedGameCover) {
        gamePreview.src = selectedGameCover;
        gamePreview.classList.remove("hidden");
      }
    }
    function showGameResults(results) {
      if (!gameResults) return;
      gameResults.innerHTML = "";
      results.forEach(game => {
        const div = document.createElement("div");
        div.className = "dropdown-item";
        const playerInfo = game.min_players && game.max_players ? ` (${game.min_players}-${game.max_players} players)` : '';
        const yearInfo = game.year_published ? ` - ${game.year_published}` : '';
        div.innerHTML = `
          <img src="${game.thumb_url}" alt="${game.name}" class="game-cover-small" onerror="this.src='https://via.placeholder.com/50?text=Game'"/>
          <div class="game-info"><strong>${escapeHtml(game.name)}</strong>${yearInfo}<small>${playerInfo}</small></div>
        `;
        div.addEventListener("click", () => selectGame(game));
        gameResults.appendChild(div);
      });
      gameResults.classList.toggle("hidden", results.length === 0);
    }
    if (gameSearchInput) {
      gameSearchInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const q = gameSearchInput.value.trim();
          if (q.length < 2) {
            if (gameResults) gameResults.classList.add("hidden");
            return;
          }
          const res = searchGames(q);
          showGameResults(res);
        }, 200);
      });
      // close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (gameResults && !gameResults.contains(e.target) && e.target !== gameSearchInput) {
          gameResults.classList.add("hidden");
        }
      });
    }


    // AI description (create page)

    async function askAssistant(message) {
      const key = getOpenAIKey();
      if (!key) return "Please add your OpenAI API key to localStorage (openai_api_key) or expose window.OPENAI_API_KEY for the assistant to work.";

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a friendly assistant helping users with board games..." },
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 300
          })
        });
        const data = await res.json();
        if (data.error) return "Error: " + data.error.message;
        return data.choices?.[0]?.message?.content?.trim() || "Sorry, couldn't generate a response.";
      } catch (err) {
        console.error("Assistant error", err);
        return "Error: Could not connect to AI assistant.";
      }
    }

    if (aiDescriptionBtn) {
      aiDescriptionBtn.addEventListener("click", async () => {
        const title = document.getElementById("title")?.value;
        const game = gameSearchInput?.value;
        if (!title || !game) {
          alert("Please enter a title and select a game first.");
          return;
        }
        aiDescriptionBtn.textContent = "Generating...";
        aiDescriptionBtn.disabled = true;
        const prompt = `Write a short, fun, and inviting description for a board game session titled "${title}" featuring the game "${game}". Keep it under 100 words.`;
        const desc = await askAssistant(prompt);
        const descEl = document.getElementById("description");
        if (descEl) descEl.value = desc;
        aiDescriptionBtn.textContent = "✨ Generate Description";
        aiDescriptionBtn.disabled = false;
      });
    }


    // AI Assistant chat widget

    function addAssistantMessage(sender, text) {
      if (!assistantMessages) return;
      const msg = document.createElement("div");
      msg.className = sender === "user" ? "msg-user" : "msg-bot";
      msg.textContent = text;
      assistantMessages.appendChild(msg);
      assistantMessages.scrollTop = assistantMessages.scrollHeight;
      return msg;
    }

    if (assistantBtn) {
      assistantBtn.addEventListener("click", () => {
        if (!assistantPopup) return;
        assistantPopup.classList.toggle("hidden");
        const isHidden = assistantPopup.classList.contains("hidden");
        assistantBtn.setAttribute("aria-expanded", isHidden ? "false" : "true");
        assistantPopup.setAttribute("aria-hidden", isHidden ? "true" : "false");
      });
    }
    if (closeAssistant) {
      closeAssistant.addEventListener("click", () => {
        if (!assistantPopup) return;
        assistantPopup.classList.add("hidden");
        assistantBtn.setAttribute("aria-expanded", "false");
        assistantPopup.setAttribute("aria-hidden", "true");
      });
    }

    async function sendAssistantMessage() {
      if (!assistantInput) return;
      const text = assistantInput.value.trim();
      if (!text) return;
      addAssistantMessage("user", text);
      assistantInput.value = "";
      const thinkingNode = addAssistantMessage("bot", "Thinking...");
      const reply = await askAssistant(text);
      thinkingNode.textContent = reply;
    }

    if (assistantSend) assistantSend.addEventListener("click", sendAssistantMessage);
    if (assistantInput) assistantInput.addEventListener("keypress", (e) => { if (e.key === "Enter") sendAssistantMessage(); });


    // Profile page: joined sessions view & leave

    function renderJoinedSessions() {
      if (!joinedSessionsContainer) return;
      const joined = loadJoinedSessions();
      joinedSessionsContainer.innerHTML = "";
      if (joined.length === 0) {
        joinedSessionsContainer.innerHTML = "<p class='no-sessions'>No sessions joined yet. <a href='index.html'>Browse sessions!</a></p>";
        return;
      }
      joined.forEach(s => {
        const card = document.createElement("div");
        card.className = "session-card-small";
        card.innerHTML = `
          <img src="${s.cover || ''}" alt="${escapeHtml(s.game)}" class="session-card-small-img" />
          <h4>${escapeHtml(s.title)}</h4>
          <p><strong>${escapeHtml(s.game)}</strong></p>
          <p>📅 ${escapeHtml(s.date)} | 🕐 ${escapeHtml(s.time)}</p>
          <p>📍 ${escapeHtml(s.location)}</p>
          <button class="leave-btn" data-id="${s.id}">Leave</button>
        `;
        const leaveBtn = card.querySelector(".leave-btn");
        leaveBtn.addEventListener("click", () => {
          let cur = loadJoinedSessions();
          cur = cur.filter(x => x.id !== s.id);
          saveJoinedSessions(cur);
          renderJoinedSessions();
        });
        joinedSessionsContainer.appendChild(card);
      });
    }

    // initial render for profile page
    renderJoinedSessions();

    if (sessionListEl) {
      renderSessions(getAllSessions());
    }

    // expose some functions for debugging in console
    window.GameMeet = {
      getAllSessions,
      renderSessions,
      loadStoredSessions,
      saveStoredSessions,
      loadJoinedSessions,
      saveJoinedSessions,
      renderJoinedSessions
    };
  }); 
} 
