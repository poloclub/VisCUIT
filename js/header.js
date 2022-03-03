let headerDiv = document.getElementById("header");
let headerIconDiv = document.createElement("div");
let headerTitleDiv = document.createElement("div");
headerIconDiv.setAttribute("id", "header-icon");
headerTitleDiv.setAttribute("id", "header-title");
headerDiv.appendChild(headerIconDiv);
headerDiv.appendChild(headerTitleDiv);

let headerIconImg = document.createElement("img");
headerIconImg.setAttribute("src", "assets/logo/viscuit.svg");
headerIconImg.setAttribute("height", "42px");
headerIconImg.setAttribute("width", "42px");
headerIconDiv.appendChild(headerIconImg);

let headerTitleV = document.createElement("div");
let headerTitleIs = document.createElement("div");
let headerTitleCuit = document.createElement("div");
headerTitleV.setAttribute("id", "header-title-v");
headerTitleIs.setAttribute("id", "header-title-is");
headerTitleCuit.setAttribute("id", "header-title-cuit");
headerTitleV.innerText = "V";
headerTitleIs.innerText = "IS";
headerTitleCuit.innerText = "CUIT";
headerTitleDiv.appendChild(headerTitleV);
headerTitleDiv.appendChild(headerTitleIs);
headerTitleDiv.appendChild(headerTitleCuit);

headerIconImg.addEventListener("click", () => {setTimeout("location.reload(true);",100);});
headerTitleDiv.addEventListener("click", () => {setTimeout("location.reload(true);",100);});
headerIconImg.style["cursor"] = "pointer";
headerTitleDiv.style["cursor"] = "pointer";