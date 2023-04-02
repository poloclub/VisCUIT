import { removeGradcamWindows, biasedSubgroupEntryClicked, biasedSubgroupEntryHovered, biasedSubgroupEntryMouseOut, imageClicked, removeNeuronConceptWindows } from "./functions.js";

let selectionDiv = document.getElementById("selection");
let biasedSubgroupsDiv = document.createElement("div");
let similarUnbiasedSubgroupDiv = document.createElement("div");
let subgroupInfoSummaryDiv = document.createElement("div");
biasedSubgroupsDiv.setAttribute("id", "biased-subgroups");
similarUnbiasedSubgroupDiv.setAttribute("id", "similar-unbiased-subgroup");
subgroupInfoSummaryDiv.setAttribute("id", "subgroup-info-summary");
selectionDiv.appendChild(biasedSubgroupsDiv);
selectionDiv.appendChild(similarUnbiasedSubgroupDiv);
selectionDiv.appendChild(subgroupInfoSummaryDiv);

let biasedSubgroupsTitleDiv = document.createElement("div");
biasedSubgroupsTitleDiv.setAttribute("id", "biased-subgroups-title");
biasedSubgroupsTitleDiv.innerText = "Underperforming Subgroups";
biasedSubgroupsDiv.appendChild(biasedSubgroupsTitleDiv);

let biasedSubgroupsTitleByAccuracyDiv = document.createElement("div");
biasedSubgroupsTitleByAccuracyDiv.setAttribute("id", "biased-subgroups-title-by-accuracy");
biasedSubgroupsTitleByAccuracyDiv.innerText = "by accuracy";
biasedSubgroupsDiv.appendChild(biasedSubgroupsTitleByAccuracyDiv)

let biasedSubgroupsListsDiv = document.createElement("div");
biasedSubgroupsListsDiv.setAttribute("id", "biased-subgroups-list");
biasedSubgroupsListsDiv.setAttribute("class", "biased-element");
biasedSubgroupsDiv.appendChild(biasedSubgroupsListsDiv);
biasedSubgroupsListsDiv.addEventListener("scroll", removeGradcamWindows);

// Generate divs as many as the biased subgroups
import {getBiasedSubgroupData} from "./data.js";

getBiasedSubgroupData().then(
    biasedSubgroupsObj => {
        let sortable = [];
        for (let subgroup in biasedSubgroupsObj) sortable.push([subgroup, biasedSubgroupsObj[subgroup]["accuracy"]]);
        sortable.sort((a, b) => a[1] - b[1]);
        let cnt = 0;
        
        for (let sortableIdx=0 ; sortableIdx < sortable.length ; sortableIdx++) {
            let property = sortable[sortableIdx][0];
            cnt += 1;

            let biasedSubgroupEntryDiv = document.createElement("div");
            biasedSubgroupEntryDiv.setAttribute("id", "biased-subgroup-"+String(property));
            biasedSubgroupEntryDiv.setAttribute("class", "subgroup-entry");
            biasedSubgroupEntryDiv.addEventListener("mouseover", biasedSubgroupEntryHovered, true);
            biasedSubgroupEntryDiv.addEventListener("mouseout", biasedSubgroupEntryMouseOut, true);
            biasedSubgroupEntryDiv.addEventListener("click", biasedSubgroupEntryClicked, true);
            biasedSubgroupEntryDiv.biasedSubgroupIdNumber = property;
            biasedSubgroupEntryDiv.newIdNumber = cnt;
            biasedSubgroupEntryDiv.biasedSubgroupInfo = biasedSubgroupsObj[property];
            biasedSubgroupEntryDiv.unbiasedSubgroupIdNumber = biasedSubgroupsObj[property]["closest"];
            biasedSubgroupsListsDiv.appendChild(biasedSubgroupEntryDiv);

            let biasedSubgroupEntryInfoDiv = document.createElement("div");
            biasedSubgroupEntryInfoDiv.setAttribute("class", "subgroup-entry-info");
            biasedSubgroupEntryDiv.appendChild(biasedSubgroupEntryInfoDiv);

            let biasedSubgroupEntryAccuracyValueDiv = document.createElement("div");
            biasedSubgroupEntryAccuracyValueDiv.setAttribute("id", "biased-subgroup-"+String(property)+"-entry-accuracy-value");
            biasedSubgroupEntryAccuracyValueDiv.setAttribute("class", "subgroup-entry-accuracy-value");
            biasedSubgroupEntryAccuracyValueDiv.innerText = String(Math.round(biasedSubgroupsObj[property]["accuracy"] * 1000)/10) + "%";
            biasedSubgroupEntryInfoDiv.appendChild(biasedSubgroupEntryAccuracyValueDiv);

            let biasedSubgroupEntryImagesDiv = document.createElement("div");
            biasedSubgroupEntryImagesDiv.setAttribute("class", "subgroup-entry-images biased-element");
            biasedSubgroupEntryImagesDiv.setAttribute("id", "subgroup-entry-images-"+String(property));
            biasedSubgroupEntryImagesDiv.newIdNumber = cnt;
            biasedSubgroupEntryDiv.appendChild(biasedSubgroupEntryImagesDiv);

            let biasedSubgroupEntryIdNumberDiv = document.createElement("div");
            biasedSubgroupEntryIdNumberDiv.setAttribute("id", `similar-unbiased-subgroup-entry-id-number-${property}`);
            biasedSubgroupEntryIdNumberDiv.setAttribute("class", "subgroup-entry-id-number");
            biasedSubgroupEntryIdNumberDiv.innerText = `#${biasedSubgroupEntryImagesDiv.newIdNumber}`;
            biasedSubgroupEntryDiv.appendChild(biasedSubgroupEntryIdNumberDiv);
            
            biasedSubgroupsObj[property]["imagename-gndtruth-pred"].forEach (
                (d) => {
                    let imgFileName = d[0];
                    let imgNumber = imgFileName.split(".")[0];
                    let groundTruth = d[1];
                    let pred = d[2];
                    let newSubgroupIdNumber = biasedSubgroupEntryImagesDiv.newIdNumber;

                    let biasedSubgroupEntryImageDisplayDiv = document.createElement("div");
                    biasedSubgroupEntryImageDisplayDiv.setAttribute("class", "subgroup-entry-image-display");
                    biasedSubgroupEntryImageDisplayDiv.setAttribute("id", "subgroup-entry-image-display-"+String(imgNumber));

                    let biasedSubgroupEntryImageDisplayImg = document.createElement("img");
                    biasedSubgroupEntryImageDisplayImg.setAttribute("src", "./assets/data/img/"+imgFileName);
                    biasedSubgroupEntryImageDisplayImg.setAttribute("height", "55px");
                    biasedSubgroupEntryImageDisplayImg.setAttribute("id", "biased-subgroup-entry-image-"+String(imgNumber));
                    if (biasedSubgroupsObj[property]["incorrect_list"].includes(imgFileName)) 
                        biasedSubgroupEntryImageDisplayDiv.setAttribute("class", "subgroup-entry-image-incorrect subgroup-entry-image-display");

                    biasedSubgroupEntryImagesDiv.appendChild(biasedSubgroupEntryImageDisplayDiv);
                    biasedSubgroupEntryImageDisplayDiv.appendChild(biasedSubgroupEntryImageDisplayImg);

                    biasedSubgroupEntryImageDisplayDiv.addEventListener("click", (e) => imageClicked(e, imgFileName, groundTruth, pred, true, newSubgroupIdNumber));

                }
            )

            biasedSubgroupEntryImagesDiv.addEventListener("scroll", e => removeGradcamWindows(e));
        }

        let incorrectMarkerTranslateX = 38;
        let incorrectMarkerTranslateY = 48;

        d3.selectAll(".subgroup-entry-image-incorrect")
            .append("svg")
                .attr("class", "subgroup-entry-image-incorrect-svg")
                .attr("width", "45px")
                .attr("height", "55px")
                .style("position", "absolute")
                .style("top", "0px")
                .style("left", "0px")
                .style("opacity", "0.9")

        d3.selectAll(".subgroup-entry-image-incorrect-svg")
            .append("line")
                .attr("x1", incorrectMarkerTranslateX-3.5)
                .attr("y1", incorrectMarkerTranslateY-3.5)
                .attr("x2", incorrectMarkerTranslateX+3.5)
                .attr("y2", incorrectMarkerTranslateY+3.5)
                .attr("stroke-linecap", "round")
                .style("stroke", "white")
                .style("stroke-width", "4px")

        d3.selectAll(".subgroup-entry-image-incorrect-svg")
            .append("line")
                .attr("x1", incorrectMarkerTranslateX-3.5)
                .attr("y1", incorrectMarkerTranslateY+3.5)
                .attr("x2", incorrectMarkerTranslateX+3.5)
                .attr("y2", incorrectMarkerTranslateY-3.5)
                .attr("stroke-linecap", "round")
                .style("stroke", "white")
                .style("stroke-width", "4px")

        d3.selectAll(".subgroup-entry-image-incorrect-svg")
            .append("line")
                .attr("x1", incorrectMarkerTranslateX-3.5)
                .attr("y1", incorrectMarkerTranslateY-3.5)
                .attr("x2", incorrectMarkerTranslateX+3.5)
                .attr("y2", incorrectMarkerTranslateY+3.5)
                .attr("stroke-linecap", "round")
                .style("stroke", "red")
                .style("stroke-width", "2px")

        d3.selectAll(".subgroup-entry-image-incorrect-svg")
            .append("line")
                .attr("x1", incorrectMarkerTranslateX-3.5)
                .attr("y1", incorrectMarkerTranslateY+3.5)
                .attr("x2", incorrectMarkerTranslateX+3.5)
                .attr("y2", incorrectMarkerTranslateY-3.5)
                .attr("stroke-linecap", "round")
                .style("stroke", "red")
                .style("stroke-width", "2px")

        let similarUnbiasedSubgroupTitleDiv = document.createElement("div");
        similarUnbiasedSubgroupTitleDiv.setAttribute("id", "similar-unbiased-subgroup-title");
        similarUnbiasedSubgroupTitleDiv.innerText = "Well-performing Similar Subgroup";
        similarUnbiasedSubgroupDiv.appendChild(similarUnbiasedSubgroupTitleDiv);

        let similarUnbiasedSubgroupsListDiv = document.createElement("div");
        similarUnbiasedSubgroupsListDiv.setAttribute("id", "similar-unbiased-subgroups-list");
        similarUnbiasedSubgroupDiv.appendChild(similarUnbiasedSubgroupsListDiv);

        let similarUnbiasedSubgroupEntryDiv = document.createElement("div");
        similarUnbiasedSubgroupEntryDiv.setAttribute("id", "similar-unbiased-subgroup-entry");
        similarUnbiasedSubgroupEntryDiv.setAttribute("class", "subgroup-entry");
        similarUnbiasedSubgroupsListDiv.appendChild(similarUnbiasedSubgroupEntryDiv);
    }
)
.then(
    d => {
        let defaultClickedEntry = new Object();
        defaultClickedEntry.currentTarget = document.getElementById("biased-subgroup-421");
        defaultClickedEntry.target = document.getElementById("biased-subgroup-421");
        biasedSubgroupEntryClicked(defaultClickedEntry);
    }
)

let subgroupInfoSummaryTitleDiv = document.createElement("div");
subgroupInfoSummaryTitleDiv.innerText = "Confusion Matrix"
subgroupInfoSummaryTitleDiv.setAttribute("id", "subgroup-info-summary-title");
subgroupInfoSummaryDiv.appendChild(subgroupInfoSummaryTitleDiv);

let underPerformingInfoSummaryDiv = document.createElement("div");
let wellPerformingInfoSummaryDiv = document.createElement("div");
underPerformingInfoSummaryDiv.setAttribute("id", "subgroup-info-summary-underperforming");
underPerformingInfoSummaryDiv.setAttribute("class", "subgroup-info-summary-entry");
wellPerformingInfoSummaryDiv.setAttribute("id", "subgroup-info-summary-well-performing");
wellPerformingInfoSummaryDiv.setAttribute("class", "subgroup-info-summary-entry");
subgroupInfoSummaryDiv.appendChild(underPerformingInfoSummaryDiv);
subgroupInfoSummaryDiv.appendChild(wellPerformingInfoSummaryDiv);

document.getElementById("neurons").addEventListener("scroll", removeNeuronConceptWindows)
