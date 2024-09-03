

  // 

  document.addEventListener("DOMContentLoaded", function() {
    const schedule = {
        "Monday": [
            { title: "Renegade Immortal", link: "./data/video-list/renegade-immortal/renegade-immortal.html" }
        ],
        "Tuesday": [
            { title: "Swallowed Star Season 4", link: "./data/video-list/swallowed-star-season-2/swallowed-star-season-2.html" },
            { title: "The Alchemy Supreme", link: "./data/video-list/the-alchemy-supreme/the-alchemy-supreme.html" }
        ],
        "Wednesday": [
            { title: "Peerless Battle Spirit", link: "./data/video-list/peerless-battle-spirt-jueshi-zhan-hun/peerless-battle-spirt-jueshi-zhan-hun.html" }
        ],
        "Thursday": [
            { title: "Throne of Seal", link: "./data/video-list/throne-of-seal/throne-of-seal.html" },
            { title: "Dragon Prince Yuan", link: "./data/video-list/dragon-prince-yuan-yuan-zun/dragon-prince-yuan-yuan-zun.html" }
        ],
        "Friday": [
            { title: "The Alchemy Supreme", link: "./data/video-list/the-alchemy-supreme/the-alchemy-supreme.html" },
            { title: "Perfect World", link: "./data/video-list/perfect-world/perfect-world.html" },
            { title: "Apotheosis [Become a God]", link: "./data/video-list/apotheosis-become-a-god-2/apotheosis-become-a-god-2.html" }
        ],
        "Saturday": [
            { title: "Soul Land 2 : The Unrivaled Tang Sect", link: "./data/video-list/soul-land-2/soul-land-2.html" },
            { title: "One Hundred Thousand Years of Qi Refining", link: "./data/video-list/one-hundred-thousand-years-of-qi-refining/one-hundred-thousand-years-of-qi-refining.html" }
        ],
        "Sunday": [
            { title: "Battle Through the Heavens", link: "./data/video-list/battle-through-the-heaven-5/battle-through-the-heaven-5.html" }
        ]
        // Add more days and releases as needed
    };

    const tbody = document.querySelector("tbody");

    for (let day in schedule) {
        const tr = document.createElement("tr");

        const dayTd = document.createElement("td");
        dayTd.textContent = day;
        tr.appendChild(dayTd);

        const releaseTd = document.createElement("td");
        
        schedule[day].forEach((item, index) => {
            const link = document.createElement("a");
            link.href = item.link;
            link.textContent = item.title;
            link.style.marginRight = "10px"; // Add space between links
            
            releaseTd.appendChild(link);
            if (index < schedule[day].length - 1) {
                releaseTd.appendChild(document.createTextNode(", "));
            }
        });

        tr.appendChild(releaseTd);
        tbody.appendChild(tr);
    }
});