
const twitchChannelsUrl = "https://wind-bow.glitch.me/twitch-api/channels/";
const twitchStreamsUrl = "https://wind-bow.glitch.me/twitch-api/streams/";
const streamerNameList = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas"];
let streamerChannels; //Array to hold channel object for each streamer. 

const tabAll = document.getElementById("tabAll");
const tabOnline = document.getElementById("tabOnline");
const tabOffline = document.getElementById("tabOffline");
const channelList = document.getElementById("channelList");
const channelSearchInput = document.getElementById("channelSearchInput");

function displayChannels(streamers) {
	//Make li for each streamer channel
	const tempStreamList  = streamers.map(function(channel) {
		//Extract streamer data to be used in string template		
		const {name, url, logo, status, viewers}  = channel;
		//String template for streamer li
		//Store online/offline status and streamer name in li data attr for filter use later
		//If streamer is online display viewer count and stream status text
		return  `
			<li data-status="${viewers? 'Online':'Offline'}" data-name="${name}" id="channel" ">			
	 			<a href="${url}">
					<div class="channelWrap ${viewers ? "Online":""}">				 	
					 	<div class="channelItem">
					 		<img src="${logo ? logo:"http://placehold.it/100x100"}" class="streamerIcon"> 
					 	</div>
					 	<div class="channelItem ${viewers ? "Online":""}">
					 		<p class="streamerName ">${name}</p>
					 		<p class="streamStatusText ${viewers ? "":"displayNone"} ">${status}</p>			 		
					 	</div>
					 	<div class="channelStatus  ${viewers ? "Online":""}"> 			 		
					 		<p> ${viewers ? "Online":"Offline"} </p>
					 		<p class="${viewers ? "":"displayNone"}">viewers: ${viewers}</p>					 		
					 	</div>		 
				 	</div>
		 		</a>
	 		</li>
		`;
	});
	//Attach li for each steamer channel to channelList ul 
	channelList.innerHTML = tempStreamList.join("");
}

//Add viewers count to channel object of streamer if streamer is online (stream object is not null) 
function updateChannels(channels) {	
	if (streamerChannels !== undefined) {
		channels.forEach(function(stream) {
			//Check if stream is online/offline 
			if (stream.stream !== null && stream.stream.channel.hasOwnProperty('name')) {
				//If stream is online get viewers value	and add to channel object with matching streamer name.					
				streamerChannels.forEach(function(channel) {
					if (channel.name === stream.stream.channel.name) {
						channel["viewers"] = stream.stream.viewers;
					}					
				})			
			}						
		})		
	}
} 

//Fetch channel/stream data of streamers depending on url used
function getStreamersData(url, streamers) {
	return streamers.map(streamer => fetch(url + streamer));
}

function getChannels() {
	//Get all streamer channel named in streamerNameList array.
	Promise.all(getStreamersData(twitchChannelsUrl, streamerNameList))
	.then(resp => {			
		//Convert all promises from channel fetch to json
		return Promise.all(resp.map(res => res.json()));	
	})
	.then(resp1 => {	
		//Store all fetched streamer channels object in streamerChannels			
		streamerChannels = resp1;
		//Get all streamer streams named in streamerNameList array. 
		//Streams contains information if streamer is online/offline
		return Promise.all(getStreamersData(twitchStreamsUrl, streamerNameList));
	})
	.then(resp2 => {		
		//Convert all promises from streams fetch to json
		return Promise.all(resp2.map(res1 => res1.json()));	
	})
	.then(resp3 => {				
		//Add viewers count to channel object of streamer if streamer is online		
		updateChannels(resp3);		
		//Render all channels
		displayChannels(streamerChannels);		
	})
	.catch((err) =>	console.log(JSON.stringify(err)));
}

//Set one of the three tabs active (All, Online, Offline)
function setTabActive(currentSelectedTab) {
	tabAll.classList.remove("active");
	tabOnline.classList.remove("active");
	tabOffline.classList.remove("active");
	currentSelectedTab.classList.add("active");
}

//Display all streamers, tabAll is now active
function displayAll() {
	//Clear search input field
	channelSearchInput.value = "";

	setTabActive(tabAll);
	//Display all streamers Li
	channelList.childNodes.forEach(function(node) {
		if(node.nodeName == "LI") {						
			node.classList.remove("displayNone");
		}
	})
}

//Display all online streamers, tabOnline is now active
function displayOnlineStreamer() {
	//Clear search input field
	channelSearchInput.value = "";

	setTabActive(tabOnline);
	//Display only online streamers li
	channelList.childNodes.forEach(function(node) {
		if(node.nodeName == "LI") {	
			node.classList.add("displayNone");
			if(node.dataset.status ==="Online") {
				node.classList.remove("displayNone");
			}
		}
	})
}

//Display all offline streamers, tabOffline is now active
function displayOfflineStreamer() {
	//Clear search input field
	channelSearchInput.value = "";
	
	setTabActive(tabOffline);
	//Display only offline streamers li
	channelList.childNodes.forEach(function(node) {
		if(node.nodeName == "LI") {	
			node.classList.remove("displayNone");			
			if(node.dataset.status ==="Online") {
				node.classList.add("displayNone");				
			}
		}
	})
}

//Channel search shows streamers matching current search input text
//Depending on which tab is currently active (All, Online Offline) 
//show only streamer matching active tab and input text
function channelSearch() {	
	//Loop through all streamer li 
	channelList.childNodes.forEach(function(node) {
		if(node.nodeName == "LI") {
			//Hide current li
			node.classList.add("displayNone");
			//Check if current li name match search value
			if (node.dataset.name.includes(channelSearchInput.value.toLowerCase())) {
				//If current li matches search value and tabAll is active, show li
				if (tabAll.classList.contains("active")) {
					node.classList.remove("displayNone");
					return;					
				}
				//If current li matches search value and tabOnline is active, show li only if streamer is online
				if (tabOnline.classList.contains("active") && node.dataset.status ==="Online") {
					node.classList.remove("displayNone");	
					return;				
				}
				//If current li matches search value and tabOffline is active, show li only if streamer is offline
				if (tabOffline.classList.contains("active") && node.dataset.status ==="Offline") {
					node.classList.remove("displayNone");	
					return;				
				}

			}					
		}
	})
}

//Setup eventListener for filter tabs and filter input
tabAll.addEventListener('click', displayAll);
tabOnline.addEventListener('click', displayOnlineStreamer);
tabOffline.addEventListener('click', displayOfflineStreamer);
channelSearchInput.addEventListener('keyup', channelSearch);

getChannels();