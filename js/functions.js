import { getUnbiasedSubgroupData, getNeuronConcept, getNeuronClusters } from "./data.js";
import { LAYERS, UNDERPERFORMING_COLOR, BOTH_COLOR, WELLPERFORMING_COLOR } from "./data.js";
let clicked = false;
let clickedId = -1;
let previousClickedId = -1;
let windowStack = [];

export const biasedSubgroupEntryClicked = (e) => {

    while (windowStack.length > 0) {
        let idToRemove = windowStack.pop();
        idToRemove.forEach(id => {
            let element = document.getElementById(id);
            element.remove();
        })
    }

    let similarUnbiasedSubgroupEntryDiv = document.getElementById("similar-unbiased-subgroup-entry");
    let subgroupInfoSummaryUnderperformingDiv = document.getElementById("subgroup-info-summary-underperforming");
    let subgroupInfoSummaryWellPerformingDiv = document.getElementById("subgroup-info-summary-well-performing");
    similarUnbiasedSubgroupEntryDiv.innerHTML = "";
    subgroupInfoSummaryUnderperformingDiv.innerHTML = "";
    subgroupInfoSummaryWellPerformingDiv.innerHTML = "";
    
    clicked = true;
    previousClickedId = clickedId;

    let selectedBiasedSubgroupIdNumber = clickedId = e.currentTarget.biasedSubgroupIdNumber;
    let selectedBiasedSubgroupInfo = e.currentTarget.biasedSubgroupInfo;
    let similarUnbiasedSubgroupIdNumber = e.currentTarget.unbiasedSubgroupIdNumber;
    let similarUnbiasedSubgroupNewIdNumber = e.currentTarget.newIdNumber;
    let similarUnbiasedSubgroupInfo;

    // delete the existing selected subgroup
    d3.select(`#biased-subgroup-${previousClickedId}`)
        .attr("class", "subgroup-entry")
        .style("border-left", "7px solid #00000000")
        .style("background-color", "")
        .style("position", "relative")
        .style("top", "")
        .style("z-index", "")
        .style("cursor", "pointer")
    .select(".subgroup-entry-accuracy-value")
        .style("color", "#909090")

    d3.select(`#biased-subgroup-${clickedId}`)
        .attr("class", "subgroup-entry selected-biased-subgroup")
        .style("border-left", "7px solid "+UNDERPERFORMING_COLOR)
        .style("background-color", "#FFE6C8")
        .style("position", "sticky")
        .style("top", "0")
        .style("bottom", "0")
        .style("z-index", "10")
        .style("cursor", "auto")
        .select(".subgroup-entry-info")
            .style("color", "#202020");

    d3.select(`#biased-subgroup-${clickedId}`)
        .select(".subgroup-entry-images")
            .style("width", "360px");

    d3.select("#similar-unbiased-subgroup-entry")
        .style("border-left", "7px solid "+WELLPERFORMING_COLOR);

    // remove event listener from the clicked group, bring back the event listener for the previously clicked group
    let clickedBiasedSubgroupEntryDiv = document.getElementById(`biased-subgroup-${clickedId}`);
    clickedBiasedSubgroupEntryDiv.removeEventListener("click", biasedSubgroupEntryClicked, true);
    clickedBiasedSubgroupEntryDiv.removeEventListener("mouseover", biasedSubgroupEntryHovered, true);
    clickedBiasedSubgroupEntryDiv.removeEventListener("mouseout", biasedSubgroupEntryMouseOut, true);
    if (previousClickedId > 0) {
        let previouslyClickedBiasedSubgroupEntryDiv = document.getElementById(`biased-subgroup-${previousClickedId}`);
        previouslyClickedBiasedSubgroupEntryDiv.addEventListener("click", biasedSubgroupEntryClicked, true);
        previouslyClickedBiasedSubgroupEntryDiv.addEventListener("mouseover", biasedSubgroupEntryHovered, true);
        previouslyClickedBiasedSubgroupEntryDiv.addEventListener("mouseout", biasedSubgroupEntryMouseOut, true);
    }

    getUnbiasedSubgroupData().then((unbiasedSubgroupObj) => {
        similarUnbiasedSubgroupInfo = unbiasedSubgroupObj[similarUnbiasedSubgroupIdNumber];

        let similarUnbiasedSubgroupDiv = document.getElementById("similar-unbiased-subgroup");
        similarUnbiasedSubgroupDiv.selectedBiasedSubgroupIdNumber = selectedBiasedSubgroupIdNumber;
        similarUnbiasedSubgroupDiv.selectedBiasedSubgroupInfo = selectedBiasedSubgroupInfo;
        similarUnbiasedSubgroupDiv.similarUnbiasedSubgroupIdNumber = similarUnbiasedSubgroupIdNumber;
        similarUnbiasedSubgroupDiv.unbiasedSubgroupInfo = similarUnbiasedSubgroupInfo;
        similarUnbiasedSubgroupDiv.newIdNumber = similarUnbiasedSubgroupNewIdNumber;

        displaySimilarUnbiasedSubgroup(similarUnbiasedSubgroupInfo, similarUnbiasedSubgroupNewIdNumber);
        displaySubgroupInfoSummary(selectedBiasedSubgroupInfo, similarUnbiasedSubgroupInfo, similarUnbiasedSubgroupNewIdNumber, similarUnbiasedSubgroupIdNumber)
        displayNeuronPath(selectedBiasedSubgroupInfo, similarUnbiasedSubgroupInfo, similarUnbiasedSubgroupNewIdNumber);
    });

};

function displaySubgroupInfoSummary(selectedBiasedSubgroupInfo, similarUnbiasedSubgroupInfo, biasedSubgroupNewIdNumber, similarUnbiasedSubgroupNewIdNumber) {
    let underPerformingInfoSummaryDiv = document.getElementById("subgroup-info-summary-underperforming");
    let wellPerformingInfoSummaryDiv = document.getElementById("subgroup-info-summary-well-performing");

    let underPerformingSubgroupConfusionMatrixTable = document.createElement("table");
    let wellPerformingSubgroupConfusionMatrixTable = document.createElement("table");
    underPerformingSubgroupConfusionMatrixTable.setAttribute("class", "confusion-matrix");
    underPerformingSubgroupConfusionMatrixTable.setAttribute("id", "confusion-matrix-underperforming");
    wellPerformingSubgroupConfusionMatrixTable.setAttribute("class", "confusion-matrix");
    wellPerformingSubgroupConfusionMatrixTable.setAttribute("id", "confusion-matrix-well-performing");
    underPerformingInfoSummaryDiv.appendChild(underPerformingSubgroupConfusionMatrixTable);
    wellPerformingInfoSummaryDiv.appendChild(wellPerformingSubgroupConfusionMatrixTable);
    createConfusionMatrix(underPerformingSubgroupConfusionMatrixTable, selectedBiasedSubgroupInfo, biasedSubgroupNewIdNumber, "underperforming");
    createConfusionMatrix(wellPerformingSubgroupConfusionMatrixTable, similarUnbiasedSubgroupInfo, similarUnbiasedSubgroupNewIdNumber, "well-performing");
}

function createConfusionMatrix(dom, info, newIdNumber, performance) {
    let ss=0, sn=0, ns=0, nn=0;  // ground truth, pred
    info["imagename-gndtruth-pred"].forEach((d, i) => {
        if (d[1]=="Smiling" && d[2]=="Smiling") ss++;
        else if (d[1]=="Smiling" && d[2]=="Not smiling") sn++;
        else if (d[1]=="Not smiling" && d[2]=="Smiling") ns++;
        else if (d[1]=="Not smiling" && d[2]=="Not smiling") nn++;
    })
    let thead = document.createElement("thead");
    let tbody = document.createElement("tbody");
    dom.appendChild(thead);
    dom.appendChild(tbody);

    let trGroundTruth = document.createElement("tr");
    let trLabel = document.createElement("tr");
    thead.appendChild(trGroundTruth);
    thead.appendChild(trLabel);

    let thTitle = document.createElement("th");
    thTitle.setAttribute("colspan", "2");
    thTitle.setAttribute("rowspan", "2");
    thTitle.setAttribute("class", "confusion-matrix-title");
    trGroundTruth.appendChild(thTitle);

    let thGroundTruth = document.createElement("th");
    thGroundTruth.setAttribute("colspan", "2");
    thGroundTruth.setAttribute("class", "confusion-matrix-ground-truth");
    thGroundTruth.innerText = "Ground Truth";
    trGroundTruth.appendChild(thGroundTruth);

    let thSmiling = document.createElement("th");
    let thNotSmiling = document.createElement("th");
    thSmiling.setAttribute("class", "confusion-matrix-label");
    thNotSmiling.setAttribute("class", "confusion-matrix-label confusion-matrix-label-not-smiling");
    thSmiling.innerText = "Smiling";
    thNotSmiling.innerText = "Not Smiling";
    trLabel.appendChild(thSmiling);
    trLabel.appendChild(thNotSmiling);

    let trFirstRow = document.createElement("tr");
    let trSecondRow = document.createElement("tr");
    tbody.appendChild(trFirstRow);
    tbody.appendChild(trSecondRow);

    let tdPredicted = document.createElement("td");
    let tdSmiling = document.createElement("td");
    let tdFirstRowFirstCol = document.createElement("td");
    let tdFirstRowSecondCol = document.createElement("td");
    tdPredicted.setAttribute("rowspan", "2");
    tdPredicted.setAttribute("class", "confusion-matrix-predicted");
    tdSmiling.setAttribute("class", "confusion-matrix-label ");
    tdFirstRowFirstCol.setAttribute("class", "confusion-matrix-1-1");
    tdFirstRowSecondCol.setAttribute("class", "confusion-matrix-1-2");
    tdPredicted.innerText = "Prediction";
    tdSmiling.innerText = "Smiling";
    tdFirstRowFirstCol.innerText = ss; // using the info, get the number
    tdFirstRowSecondCol.innerText = ns;
    trFirstRow.appendChild(tdPredicted);
    trFirstRow.appendChild(tdSmiling);
    trFirstRow.appendChild(tdFirstRowFirstCol);
    trFirstRow.appendChild(tdFirstRowSecondCol);

    let tdNotSmiling = document.createElement("td");
    let tdSecondRowFirstCol = document.createElement("td");
    let tdSecondRowSecondCol = document.createElement("td");
    tdNotSmiling.setAttribute("class", "confusion-matrix-label confusion-matrix-label-not-smiling");
    tdSecondRowFirstCol.setAttribute("class", "confusion-matrix-2-1 ");
    tdSecondRowSecondCol.setAttribute("class", "confusion-matrix-2-2");
    tdNotSmiling.innerText = "Not\nSmiling";
    tdSecondRowFirstCol.innerText = sn;
    tdSecondRowSecondCol.innerText = nn;
    trSecondRow.appendChild(tdNotSmiling);
    trSecondRow.appendChild(tdSecondRowFirstCol);
    trSecondRow.appendChild(tdSecondRowSecondCol);

    let confusionMatrixTitleDiv = document.createElement("div");
    confusionMatrixTitleDiv.setAttribute("id", `confusion-matrix-${performance}-subgroup-title`);
    thTitle.appendChild(confusionMatrixTitleDiv);

    let confusionMatrixTitleUpperDiv = document.createElement("div");
    let confusionMatrixTitleLowerDiv = document.createElement("div");
    confusionMatrixTitleUpperDiv.setAttribute("id", `confusion-matrix-${performance}-subgroup-title-upper`);
    confusionMatrixTitleUpperDiv.setAttribute("class", "confusion-matrix-title-upper");
    confusionMatrixTitleLowerDiv.setAttribute("id", `confusion-matrix-${performance}-subgroup-title-lower`);
    confusionMatrixTitleLowerDiv.setAttribute("class", "confusion-matrix-title-lower");
    confusionMatrixTitleUpperDiv.innerText = performance[0].toUpperCase() + performance.substring(1);
    confusionMatrixTitleLowerDiv.innerText = (performance=="underperforming")?`Subgroup #${newIdNumber}`:`Similar Subgroup #${newIdNumber}`;
    confusionMatrixTitleDiv.appendChild(confusionMatrixTitleUpperDiv);
    confusionMatrixTitleDiv.appendChild(confusionMatrixTitleLowerDiv);
}

function displaySimilarUnbiasedSubgroup(similarUnbiasedSubgroupInfo, similarUnbiasedSubgroupNewIdNumber) {
    // Unbiased subgroup
    let similarUnbiasedSubgroupEntryDiv = document.getElementById("similar-unbiased-subgroup-entry");

    // Info div
    let similarUnbiasedSubgroupEntryInfoDiv = document.createElement("div");
    similarUnbiasedSubgroupEntryInfoDiv.setAttribute("class", "subgroup-entry-info");
    similarUnbiasedSubgroupEntryInfoDiv.setAttribute("id", "similar-unbiased-subgroup-entry-info");
    similarUnbiasedSubgroupEntryDiv.appendChild(similarUnbiasedSubgroupEntryInfoDiv);

    let similarUnbiasedSubgroupEntryAccuracyValueDiv = document.createElement("div");
    similarUnbiasedSubgroupEntryAccuracyValueDiv.setAttribute("class", "subgroup-entry-accuracy-value");
    similarUnbiasedSubgroupEntryAccuracyValueDiv.innerText = String(Math.round(similarUnbiasedSubgroupInfo["accuracy"] * 1000)/10) + "%";
    similarUnbiasedSubgroupEntryInfoDiv.appendChild(similarUnbiasedSubgroupEntryAccuracyValueDiv);

    let similarUnbiasedSubgroupEntryImagesDiv = document.createElement("div");
    similarUnbiasedSubgroupEntryImagesDiv.setAttribute("class", "subgroup-entry-images unbiased-element");
    similarUnbiasedSubgroupEntryImagesDiv.setAttribute("id", "similar-unbiased-subgroup-entry-images");
    similarUnbiasedSubgroupEntryDiv.appendChild(similarUnbiasedSubgroupEntryImagesDiv);

    let similarUnbiasedSubgroupDiv = document.getElementById("similar-unbiased-subgroup");
    let similarUnbiasedSubgroupEntryIdNumberDiv = document.createElement("div");
    similarUnbiasedSubgroupEntryIdNumberDiv.setAttribute("id", "similar-unbiased-subgroup-entry-id-number");
    similarUnbiasedSubgroupEntryIdNumberDiv.setAttribute("class", "subgroup-entry-id-number");
    similarUnbiasedSubgroupEntryIdNumberDiv.innerText = `#${similarUnbiasedSubgroupDiv.similarUnbiasedSubgroupIdNumber}`;
    similarUnbiasedSubgroupEntryDiv.appendChild(similarUnbiasedSubgroupEntryIdNumberDiv);

    similarUnbiasedSubgroupEntryImagesDiv.addEventListener("scroll", removeGradcamWindows)

    similarUnbiasedSubgroupInfo["imagename-gndtruth-pred"].forEach (
        (imageInfo) => {
            let imgFileName = imageInfo[0];
            let imgNumber = imgFileName.split(".")[0];
            let groundTruth = imageInfo[1];
            let pred = imageInfo[2];

            let similarUnbiasedSubgroupEntryImageDisplayDiv = document.createElement("div");
            similarUnbiasedSubgroupEntryImageDisplayDiv.setAttribute("class", "subgroup-entry-image-display");
            similarUnbiasedSubgroupEntryImageDisplayDiv.setAttribute("id", "subgroup-entry-image-display-"+String(imgNumber));

            let similarUnbiasedEntryImageDisplayImg = document.createElement("img");
            similarUnbiasedEntryImageDisplayImg.setAttribute("src", "./assets/data/img/"+imgFileName);
            similarUnbiasedEntryImageDisplayImg.setAttribute("height", "55px");
            similarUnbiasedEntryImageDisplayImg.setAttribute("id", "unbiased-subgroup-entry-image-"+String(imgNumber));
            if (similarUnbiasedSubgroupInfo["incorrect_list"].includes(imgFileName)) 
                similarUnbiasedSubgroupEntryImageDisplayDiv.setAttribute("class", "subgroup-entry-image-incorrect subgroup-entry-image-display");

            similarUnbiasedSubgroupEntryImageDisplayDiv.addEventListener("click", e => imageClicked(e, imgFileName, groundTruth, pred, false, similarUnbiasedSubgroupNewIdNumber));
            similarUnbiasedSubgroupEntryImagesDiv.appendChild(similarUnbiasedSubgroupEntryImageDisplayDiv);
            similarUnbiasedSubgroupEntryImageDisplayDiv.appendChild(similarUnbiasedEntryImageDisplayImg);
        }
    )

    let incorrectMarkerTranslateX = 38;
    let incorrectMarkerTranslateY = 48;
    
    let similarUnbiasedSubgroupSvg = d3.selectAll("#similar-unbiased-subgroup-entry .subgroup-entry-image-incorrect")
    
    similarUnbiasedSubgroupSvg        
        .append("svg")
            .attr("class", "subgroup-entry-image-incorrect-svg")
            .attr("width", "45px")
            .attr("height", "55px")
            .style("position", "absolute")
            .style("top", "0px")
            .style("left", "0px")
            .style("opacity", "0.9")

    similarUnbiasedSubgroupSvg
        .append("line")
            .attr("x1", incorrectMarkerTranslateX-3.5)
            .attr("y1", incorrectMarkerTranslateY-3.5)
            .attr("x2", incorrectMarkerTranslateX+3.5)
            .attr("y2", incorrectMarkerTranslateY+3.5)
            .attr("stroke-linecap", "round")
            .style("stroke", "white")
            .style("stroke-width", "4px")

    similarUnbiasedSubgroupSvg
        .append("line")
            .attr("x1", incorrectMarkerTranslateX-3.5)
            .attr("y1", incorrectMarkerTranslateY+3.5)
            .attr("x2", incorrectMarkerTranslateX+3.5)
            .attr("y2", incorrectMarkerTranslateY-3.5)
            .attr("stroke-linecap", "round")
            .style("stroke", "white")
            .style("stroke-width", "4px")

    similarUnbiasedSubgroupSvg
        .append("line")
            .attr("x1", incorrectMarkerTranslateX-3.5)
            .attr("y1", incorrectMarkerTranslateY-3.5)
            .attr("x2", incorrectMarkerTranslateX+3.5)
            .attr("y2", incorrectMarkerTranslateY+3.5)
            .attr("stroke-linecap", "round")
            .style("stroke", "red")
            .style("stroke-width", "2px")

    similarUnbiasedSubgroupSvg
        .append("line")
            .attr("x1", incorrectMarkerTranslateX-3.5)
            .attr("y1", incorrectMarkerTranslateY+3.5)
            .attr("x2", incorrectMarkerTranslateX+3.5)
            .attr("y2", incorrectMarkerTranslateY-3.5)
            .attr("stroke-linecap", "round")
            .style("stroke", "red")
            .style("stroke-width", "2px")

}

export function removeGradcamWindows (e) {
    let currentTargetClassNames = e.currentTarget.className.split(' ')
    if (currentTargetClassNames.includes("biased-element")) {
        let currentTargetId = e.currentTarget.id;
        if (currentTargetId == "biased-subgroups-list") removeGradcamWindowsBiasedOrUnbiased(true);
        else {
            let subgroupId = currentTargetId.split("-");
            subgroupId = Number(subgroupId[subgroupId.length-1]);
            if (clickedId == subgroupId) removeGradcamWindowsBiasedOrUnbiased(true);
        }
    }
    else if (currentTargetClassNames.includes("unbiased-element")) 
        removeGradcamWindowsBiasedOrUnbiased(false);
}

function removeGradcamWindowsBiasedOrUnbiased (biased) {
    let gradcamWindows = document.getElementsByClassName(`${biased?"biased":"unbiased"}-gradcam`);
    Object.entries(gradcamWindows).forEach(idxElem => {
        let gradcamWindow = idxElem[1];
        let thisId = gradcamWindow.id;
        windowStack = windowStack.filter(d => d[1]!=thisId);
        gradcamWindow.remove();
    })
}

export function imageClicked (e, imgFileName, groundTruth, pred, biased, groupNewIdNumber) {
    if (clicked && previousClickedId == clickedId) {
        let imgNumber = imgFileName.split(".")[0]
        let gradcamImageFileName = imgNumber + "_gradcam.jpg";

        let createFlag = true;
        windowStack.forEach(d => {
            if (d[0] == "selected-image-covering-"+String(imgNumber)) createFlag = false;
        });
        if (!createFlag) return;

        let coveringDiv = document.createElement("div");
        coveringDiv.setAttribute("id", "selected-image-covering-"+String(imgNumber));
        if (biased) coveringDiv.setAttribute("class", "gradcam-window-image-covering biased-gradcam");
        else coveringDiv.setAttribute("class", "gradcam-window-image-covering unbiased-gradcam");
        e.currentTarget.appendChild(coveringDiv);

        let cursorX = e.pageX;
        let cursorY = e.pageY;

        let biasedSubgroupsListsDiv = document.getElementById("biased-subgroups-list");
        let unbiasedSubgroupsListsDiv = document.getElementById("similar-unbiased-subgroups-list");
        let selectedImageHoveredWindowDiv = document.createElement("div");
        selectedImageHoveredWindowDiv.setAttribute("id", "selected-image-clicked-window-"+String(imgNumber));
        selectedImageHoveredWindowDiv.setAttribute("class", `gradcam-window ${biased?"biased-gradcam":"unbiased-gradcam"}`);
        selectedImageHoveredWindowDiv.style.position = "absolute";
        selectedImageHoveredWindowDiv.style.top = String(cursorY) + "px";
        selectedImageHoveredWindowDiv.style.left = String(cursorX) + "px";
        selectedImageHoveredWindowDiv.style["z-index"] = 10;
        if (biased) biasedSubgroupsListsDiv.appendChild(selectedImageHoveredWindowDiv);
        else unbiasedSubgroupsListsDiv.appendChild(selectedImageHoveredWindowDiv);

        let groupNewIdNumberDiv = document.createElement("div");
        groupNewIdNumberDiv.setAttribute("class", "gradcam-window-group-number");
        groupNewIdNumberDiv.innerText = biased?"Underperforming Subgroup #"+String(groupNewIdNumber):"Well-performing Similar Subgroup";
        selectedImageHoveredWindowDiv.appendChild(groupNewIdNumberDiv);

        let originalImageDiv = document.createElement("div");
        let originalImageImg = document.createElement("img");
        originalImageDiv.setAttribute("id", "selected-image-clicked-original-image")
        originalImageImg.setAttribute("id", "selected-image-clicked-original-image-display");
        originalImageImg.setAttribute("height", "100px");
        originalImageImg.setAttribute("src", "./assets/data/img/"+imgFileName);
        selectedImageHoveredWindowDiv.appendChild(originalImageDiv);
        originalImageDiv.appendChild(originalImageImg);

        let addedElementsId = ["selected-image-covering-"+String(imgNumber), "selected-image-clicked-window-"+String(imgNumber)]
        windowStack.push(addedElementsId);

        let gradcamImageDiv = document.createElement("div");
        let gradcamImageImg = document.createElement("img");
        gradcamImageDiv.setAttribute("id", "selected-image-clicked-gradcam-image")
        gradcamImageImg.setAttribute("id", "selected-image-clicked-gradcam-image-display");
        gradcamImageImg.setAttribute("height", "100px");
        gradcamImageImg.setAttribute("src", "./assets/data/gradcam/"+gradcamImageFileName);
        selectedImageHoveredWindowDiv.appendChild(gradcamImageDiv);
        gradcamImageDiv.appendChild(gradcamImageImg);

        let labelPredInfoDiv = document.createElement("div");
        selectedImageHoveredWindowDiv.appendChild(labelPredInfoDiv);

        let groundTruthDiv = document.createElement("div");
        let groundTruthTitleDiv = document.createElement("div");
        let groundTruthValueDiv = document.createElement("div");
        let predDiv = document.createElement("div");
        let predTitleDiv = document.createElement("div");
        let predValueDiv = document.createElement("div");
        groundTruthTitleDiv.innerText = "Ground Truth:";
        groundTruthValueDiv.innerText = groundTruth;
        predTitleDiv.innerText = "Prediction";
        predValueDiv.innerText = pred;
        groundTruthDiv.setAttribute("id", "selected-image-clicked-ground-truth");
        groundTruthTitleDiv.setAttribute("id", "selected-image-clicked-ground-truth-title");
        groundTruthValueDiv.setAttribute("id", "selected-image-clicked-ground-truth-value");
        predDiv.setAttribute("id", "selected-image-clicked-pred");
        predTitleDiv.setAttribute("id", "selected-image-clicked-pred-title");
        predValueDiv.setAttribute("id", "selected-image-clicked-pred-value");
        labelPredInfoDiv.appendChild(groundTruthDiv);
        groundTruthDiv.appendChild(groundTruthTitleDiv);
        groundTruthDiv.appendChild(groundTruthValueDiv);
        labelPredInfoDiv.appendChild(predDiv);
        predDiv.appendChild(predTitleDiv);
        predDiv.appendChild(predValueDiv);

        // make X box to remove the window
        let gradcamWindowXDiv= document.createElement("div");
        gradcamWindowXDiv.setAttribute("class", "gradcam-window-x");
        gradcamWindowXDiv.setAttribute("id", "gradcam-window-x-"+String(imgNumber));
        gradcamWindowXDiv.imgNumber = imgNumber;
        gradcamWindowXDiv.addEventListener("click", function (e) {
            let thisXId = this.id.split("-");
            let thisImgNumber = thisXId[thisXId.length-1];
            windowStack = windowStack.filter(d => d[0] != "selected-image-covering-"+thisImgNumber)

            this.parentElement.remove();
            document.getElementById("selected-image-covering-"+thisImgNumber).remove();
        });
        selectedImageHoveredWindowDiv.appendChild(gradcamWindowXDiv);

        gradcamWindowXDiv = d3.select("#gradcam-window-x-"+String(imgNumber));
        let gradcamWindowXSvg = gradcamWindowXDiv.append("svg").attr("height", "30").attr("width", "30");
        gradcamWindowXSvg.append("line")
            .attr("class", "gradcam-window-x-line")
            .attr("x1", "10")
            .attr("y1", "10")
            .attr("x2", "20")
            .attr("y2", "20");
        gradcamWindowXSvg.append("line")
            .attr("class", "gradcam-window-x-line")
            .attr("x1", "20")
            .attr("y1", "10")
            .attr("x2", "10")
            .attr("y2", "20");
    }

    previousClickedId = clickedId;

}

function removeWindow (e) {
    if (e.key == "Escape" && windowStack.length > 0){
        let idToRemove = windowStack.pop();

        idToRemove.forEach(id => {
            let element = document.getElementById(id);
            element.remove();
        })
    }
}

document.addEventListener("keyup", removeWindow);

export function displayNeuronPath(selectedBiasedSubgroupInfo, similarUnbiasedSubgroupInfo, newIdNumber) {
    let neuronPathDiv = document.getElementById("neuron-path");
    neuronPathDiv.innerHTML = '';
    windowStack = [];

    let neuronPathHeaderDiv = document.createElement("div");
    neuronPathHeaderDiv.setAttribute("id", "neuron-path-header");
    neuronPathDiv.appendChild(neuronPathHeaderDiv);

    let neuronPathHeaderTitleDiv = document.createElement("div");
    let neuronPathHeaderBiasedDiv = document.createElement("div");
    let neuronPathHeaderBothDiv = document.createElement("div");
    let neuronPathHeaderUnbiasedDiv = document.createElement("div");
    neuronPathHeaderBothDiv.innerText = "Both";
    neuronPathHeaderTitleDiv.setAttribute("id", "neuron-path-header-title");
    neuronPathHeaderBiasedDiv.setAttribute("id", "neuron-path-header-biased");
    neuronPathHeaderBothDiv.setAttribute("id", "neuron-path-header-both");
    neuronPathHeaderUnbiasedDiv.setAttribute("id", "neuron-path-header-unbiased");
    neuronPathHeaderDiv.appendChild(neuronPathHeaderTitleDiv);
    neuronPathHeaderDiv.appendChild(neuronPathHeaderBiasedDiv);
    neuronPathHeaderDiv.appendChild(neuronPathHeaderBothDiv);
    neuronPathHeaderDiv.appendChild(neuronPathHeaderUnbiasedDiv);

    let unbiasedSubgroupNewIdNumber = document.getElementById("similar-unbiased-subgroup").similarUnbiasedSubgroupIdNumber;

    let neuronPathHeaderBiasedUpperLineDiv = document.createElement("div");
    let neuronPathHeaderBiasedLowerLineDiv = document.createElement("div");
    let neuronPathHeaderUnbiasedUpperLineDiv = document.createElement("div");
    let neuronPathHeaderUnbiasedLowerLineDiv = document.createElement("div");
    neuronPathHeaderBiasedUpperLineDiv.innerText = "Underperforming";
    neuronPathHeaderBiasedLowerLineDiv.innerText = "Subgroup #"+String(newIdNumber);
    neuronPathHeaderUnbiasedUpperLineDiv.innerText = "Well-performing";
    neuronPathHeaderUnbiasedLowerLineDiv.innerText = "Similar Subgroup #"+String(unbiasedSubgroupNewIdNumber);
    neuronPathHeaderBiasedUpperLineDiv.setAttribute("id", "neuron-path-header-biased-upper");
    neuronPathHeaderBiasedLowerLineDiv.setAttribute("id", "neuron-path-header-biased-lower");
    neuronPathHeaderUnbiasedUpperLineDiv.setAttribute("id", "neuron-path-header-unbiased-upper");
    neuronPathHeaderUnbiasedLowerLineDiv.setAttribute("id", "neuron-path-header-unbiased-lower");
    neuronPathHeaderBiasedDiv.appendChild(neuronPathHeaderBiasedUpperLineDiv);
    neuronPathHeaderBiasedDiv.appendChild(neuronPathHeaderBiasedLowerLineDiv);
    neuronPathHeaderUnbiasedDiv.appendChild(neuronPathHeaderUnbiasedUpperLineDiv);
    neuronPathHeaderUnbiasedDiv.appendChild(neuronPathHeaderUnbiasedLowerLineDiv);


    let layers = LAYERS.reverse();
    layers.selectedBiasedSubgroupInfo = selectedBiasedSubgroupInfo;
    layers.selectedUnbiasedSubgroupInfo = similarUnbiasedSubgroupInfo;
    layers.forEach(displayNeuronForEachLayer);
    LAYERS.reverse();

    getNeuronClusters().then(clusters => {
        clusters.forEach((cluster, i) => {
            cluster.forEach((neuron) => {
                d3.selectAll(`.neuron-${neuron[0]}-${neuron[1]}`)
                    .attr("class", (_,__,dom) => {
                        let classes = dom[0].className.baseVal;
                        return `${classes} neuron-cluster-${i}`;
                    });
            })
        })
    });
}

function displayNeuronForEachLayer(layer, idx, layers) {
    let neuronPathDiv = document.getElementById("neuron-path");

    let neuronsThisLayerDiv = document.createElement("div");
    neuronsThisLayerDiv.setAttribute("class", "neurons-each-layer");
    neuronsThisLayerDiv.setAttribute("id", "neurons-layer-"+String(layer));
    neuronPathDiv.appendChild(neuronsThisLayerDiv)

    let layerNameDiv = document.createElement("div");
    let biasedNeuronsDiv = document.createElement("div");
    let bothNeuronsDiv = document.createElement("div");
    let unbiasedNeuronsDiv = document.createElement("div");
    layerNameDiv.setAttribute("class", "neuron-path-layer-name");
    layerNameDiv.innerText = layer;
    biasedNeuronsDiv.setAttribute("class", "neuron-path-biased-neurons");
    biasedNeuronsDiv.setAttribute("id", "neuron-path-biased-neurons-layer-"+layer);
    bothNeuronsDiv.setAttribute("class", "neuron-path-both-neurons");
    bothNeuronsDiv.setAttribute("id", "neuron-path-both-neurons-layer-"+layer);
    unbiasedNeuronsDiv.setAttribute("class", "neuron-path-unbiased-neurons");
    unbiasedNeuronsDiv.setAttribute("id", "neuron-path-unbiased-neurons-layer-"+layer);
    neuronsThisLayerDiv.appendChild(layerNameDiv);
    neuronsThisLayerDiv.appendChild(biasedNeuronsDiv);
    neuronsThisLayerDiv.appendChild(bothNeuronsDiv);
    neuronsThisLayerDiv.appendChild(unbiasedNeuronsDiv);

    let biasedNeuronIndices = [];
    let biasedDroppedNeuronIndices = [];
    let bothNeuronIndices = [];
    let unbiasedNeuronIndices = [];
    let biasedNeuronImportanceScores = [];
    let biasedDroppedNeuronImportanceScores = [];
    let bothNeuronImportanceScores = [];
    let unbiasedNeuronImportanceScores = [];

    let thresholdSlider = document.getElementById("setting-threshold-slider");
    let threshold = thresholdSlider.value / 10;
    let biasedImportanceScore, unbiasedImportanceScore;

    (layers.selectedBiasedSubgroupInfo["importance"][layer]).forEach((neuronInfo) => {
        biasedImportanceScore = neuronInfo[1] / layers.selectedBiasedSubgroupInfo["images"].length;
        if (biasedImportanceScore >= threshold) {
            biasedNeuronIndices.push(neuronInfo[0]);
            biasedNeuronImportanceScores.push([biasedImportanceScore, 0]);
        }
        else {
            biasedDroppedNeuronIndices.push(neuronInfo[0]);
            biasedDroppedNeuronImportanceScores.push([biasedImportanceScore, 0]);
        }
    });

    (layers.selectedUnbiasedSubgroupInfo["importance"][layer]).forEach((neuronInfo) => {
        unbiasedImportanceScore = neuronInfo[1] / layers.selectedUnbiasedSubgroupInfo["images"].length;
        if (unbiasedImportanceScore >= threshold) {
            if (biasedNeuronIndices.includes(neuronInfo[0])) {
                let idx = biasedNeuronIndices.indexOf(neuronInfo[0]);
                biasedNeuronIndices.splice(idx, 1);
                biasedImportanceScore = biasedNeuronImportanceScores[idx];
                biasedNeuronImportanceScores.splice(idx, 1);
                bothNeuronIndices.push(neuronInfo[0]);
                bothNeuronImportanceScores.push([biasedImportanceScore[0], unbiasedImportanceScore]);
            }
            else if (biasedDroppedNeuronIndices.includes(neuronInfo[0])) {
                let idx = biasedDroppedNeuronIndices.indexOf(neuronInfo[0]);
                biasedImportanceScore = biasedDroppedNeuronImportanceScores[idx];
                unbiasedNeuronIndices.push(neuronInfo[0]);
                unbiasedNeuronImportanceScores.push([biasedImportanceScore[0], unbiasedImportanceScore]);
            }
            else {
                unbiasedNeuronIndices.push(neuronInfo[0]);
                unbiasedNeuronImportanceScores.push([0, unbiasedImportanceScore]);
            }
        }
    });

    displayImportantNeurons(biasedNeuronIndices, biasedNeuronImportanceScores, "neuron-path-biased-neurons-layer-"+layer, "biased", layer);
    displayImportantNeurons(bothNeuronIndices, bothNeuronImportanceScores, "neuron-path-both-neurons-layer-"+layer, "both", layer);
    displayImportantNeurons(unbiasedNeuronIndices, unbiasedNeuronImportanceScores, "neuron-path-unbiased-neurons-layer-"+layer, "unbiased", layer);
}

function displayImportantNeurons(neuronIndices, importanceScores, domId, column, layer) {
    let neuronsDiv = d3.select("#"+domId);
    let color;
    if (column == "biased") color = UNDERPERFORMING_COLOR;
    else if (column == "both") color = BOTH_COLOR;
    else if (column == "unbiased") color = WELLPERFORMING_COLOR;
    
    let neuronNumber = neuronIndices.length;
    let width = 15*neuronNumber+5;
    let height = 22;
    let svgFrameWidth = 232, svgFrameHeight = 38; 

    let neuronFrameG = neuronsDiv
        .append("svg")
            .attr("class", "neuron-frame-svg")
            .attr("width", svgFrameWidth+"px")
        .append("g")
            .attr("class", "neuron-frame-g")

    if (neuronNumber != 0){
        neuronFrameG.append("rect")
                .attr("style", "opacity: 10%; fill: "+color)
                .attr("width", width+2)
                .attr("height", height)
                .attr("x", (svgFrameWidth-width-2)/2)
                .attr("y", (svgFrameHeight-height)/2)
                .attr("rx", height/2)
                .attr("ry", height/2);
    }

    let neuronsG = neuronsDiv
        .append("div")
            .attr("class", "neurons-display")
            .attr("id", `neurons-display-${layer}-${column}`)
            .style("width", String(svgFrameWidth)+"px")
            .style("height", `${svgFrameHeight}px`)
            .style("position", "absolute")
            .style("top", "0")
            .style("left", "0")
        .append("svg")
            .attr("class", "neurons-svg")
            .style("width", String(svgFrameWidth)+"px")
        .append("g")
            .attr("class", "neurons-g")
            .attr("transform", `translate(${(svgFrameWidth-width+10)/2},${svgFrameHeight/2})`);

    let importanceScoresObj = {};

    if (neuronNumber != 0) {
        neuronsG.selectAll()
            .data(neuronIndices)
            .join("circle")
                .style("fill", color)
                .style("opacity", 1)
                .style("stroke-width", "2px")
                .style("stroke", color)
                .style("stroke-opacity", 0)
                .attr("r", 5)
                .attr("transform", (_, i) => `translate(${15*i+5},0)`)
                .attr("id", (_,i) => `neuron-${layer}-${i}`)
                .attr("class", (d) => `neuron-circle neuron-${column} neuron-${layer}-${d}`)
                .each((d, i) => {importanceScoresObj[d] = importanceScores[i];})
                .on("click", (e, d) => displayNeuronConcept(e, layer, d, importanceScoresObj[d]))
                .on("mouseover", e => neuronNodeHovered(e, color))
                .on("mouseleave", e => neuronNodeMouseLeave(e, color));
    }

    document.getElementById(`neurons-display-${layer}-${column}`).addEventListener("scroll", function () {
        let neuronConceptWindows = document.getElementsByClassName(`neuron-concept-window-${layer}`);
        Object.entries(neuronConceptWindows).forEach(d => {
            let neuronConceptWindow = d[1];
            let thisId = neuronConceptWindow.id;
            windowStack = windowStack.filter(d => d[0]!=thisId);
            neuronConceptWindow.remove();
        })
    })
}

function neuronNodeHovered(e, color) {
    let classes = e.currentTarget.className.baseVal.split(" ");
    let neuronClusterClass = classes[classes.length - 1];

    d3.selectAll("circle.neuron-circle")
        .style("opacity", "0.2");
    d3.selectAll(`.${neuronClusterClass}`)
        .style("opacity", "1.0");

    e.currentTarget.style.fill = "white";
    e.currentTarget.style["stroke"] = color;
    e.currentTarget.style["stroke-width"] = "2px";
    e.currentTarget.style["stroke-opacity"] = 1;
    e.currentTarget.style["opacity"] = 1;
}

function neuronNodeMouseLeave(e, color) {
    let classes = e.currentTarget.className.baseVal.split(" ");
    let neuronClusterClass = classes[classes.length - 1];
    
    d3.selectAll(".neuron-circle")
        .style("opacity", "1.0");

    d3.selectAll(`.${neuronClusterClass}`)
        .style("opacity", "1")
        .style("fill", (_, i, dom) => {
            let classes = dom[i].className.baseVal.split(" ");
            let neuronColumnClass = classes[1];
            let color = (neuronColumnClass=="neuron-biased")?UNDERPERFORMING_COLOR:(neuronColumnClass=="neuron-both"?BOTH_COLOR:WELLPERFORMING_COLOR);
            return color;
        })
        .style("stroke-opacity", 0)
        .style("stroke", "")
        .style("stroke-width", "");
    
    e.currentTarget.style.fill = color;
    e.currentTarget.style["stroke-opacity"] = 0;
    e.currentTarget.style.stroke = "";
    e.currentTarget.style["stroke-width"] = "";
}

export function removeNeuronConceptWindows () {
    let neuronConceptWindows = document.getElementsByClassName("neuron-concept-window")
    Object.entries(neuronConceptWindows).forEach(d => {
        let neuronConceptWindow = d[1];
        let thisId = neuronConceptWindow.id;
        windowStack = windowStack.filter(d => d[0]!=thisId);
        neuronConceptWindow.remove();
    })
}

function displayNeuronConcept(e, layer, neuronId, importanceScores) {
    let createFlag = true;
    windowStack.forEach(d => {
        if (d[0] == "neuron-concept-window-"+layer+"-"+String(neuronId)) createFlag = false;
    });
    if (!createFlag) return;

    let neuronConceptWindow;
    let similarUnbiasedSubgroupDiv = document.getElementById("similar-unbiased-subgroup");

    let cursorX = e.pageX;
    let cursorY = e.pageY;
    let patchSize = 30;

    getNeuronConcept().then(
        neuronConcept => {
            let imagePatches = neuronConcept[layer][neuronId];

            let neuronsDiv = document.getElementById("neurons");
            let neuronsDivStyle = getComputedStyle(neuronsDiv);
            
            neuronConceptWindow = document.createElement("div");
            neuronConceptWindow.setAttribute("class", "neuron-concept-window neuron-concept-window-"+layer);
            neuronConceptWindow.setAttribute("id", "neuron-concept-window-"+layer+"-"+String(neuronId))
            neuronConceptWindow.style.position = "absolute";
            neuronConceptWindow.style.top = String(cursorY-Number(neuronsDivStyle["top"].replace("px",""))) + "px";
            neuronConceptWindow.style.left = String(cursorX-Number(neuronsDivStyle["left"].replace("px",""))) + "px";
            neuronsDiv.appendChild(neuronConceptWindow);

            windowStack.push(["neuron-concept-window-"+layer+"-"+String(neuronId)]);

            let neuronConceptTitleDiv = document.createElement("div");
            let neuronConceptImportanceScoreDiv = document.createElement("div");
            let neuronConceptPatchesDiv = document.createElement("div");
            neuronConceptTitleDiv.setAttribute("class", "neuron-concept-title");
            neuronConceptTitleDiv.innerText = layer + " #" + String(neuronId);
            neuronConceptImportanceScoreDiv.setAttribute("class", "neuron-concept-importance-score");
            neuronConceptPatchesDiv.setAttribute("class", "neuron-concept-patches")
            neuronConceptWindow.appendChild(neuronConceptTitleDiv);
            neuronConceptWindow.appendChild(neuronConceptImportanceScoreDiv);
            neuronConceptWindow.appendChild(neuronConceptPatchesDiv);

            let neuronConceptImportanceScoreTitleDiv = document.createElement("div");
            let neuronConceptImportanceScoreBiasedDiv = document.createElement("div");
            let neuronConceptImportanceScoreUnbiasedDiv = document.createElement("div");
            neuronConceptImportanceScoreTitleDiv.setAttribute("class", "neuron-concept-importance-score-title");
            neuronConceptImportanceScoreTitleDiv.innerText = "Importance Score";
            neuronConceptImportanceScoreBiasedDiv.setAttribute("class", "neuron-concept-importance-score-biased");
            neuronConceptImportanceScoreUnbiasedDiv.setAttribute("class", "neuron-concept-importance-score-unbiased");
            neuronConceptImportanceScoreDiv.appendChild(neuronConceptImportanceScoreTitleDiv);
            neuronConceptImportanceScoreDiv.appendChild(neuronConceptImportanceScoreBiasedDiv);
            neuronConceptImportanceScoreDiv.appendChild(neuronConceptImportanceScoreUnbiasedDiv);

            let neuronConceptImportanceScoreBiasedTitleDiv = document.createElement("div");
            let neuronConceptImportanceScoreBiasedValueDiv = document.createElement("div");
            let neuronConceptImportanceScoreUnbiasedTitleDiv = document.createElement("div");
            let neuronConceptImportanceScoreUnbiasedValueDiv = document.createElement("div");
            neuronConceptImportanceScoreBiasedTitleDiv.innerText = "- Underperforming: ";
            neuronConceptImportanceScoreBiasedTitleDiv.setAttribute("class", "neuron-concept-importance-score-biased-title");
            neuronConceptImportanceScoreBiasedValueDiv.innerText = String(Math.round(importanceScores[0] * 100) / 100);
            neuronConceptImportanceScoreBiasedValueDiv.setAttribute("class", "neuron-concept-importance-score-biased-value");
            neuronConceptImportanceScoreUnbiasedTitleDiv.innerText = "- Well-performing: ";
            neuronConceptImportanceScoreUnbiasedTitleDiv.setAttribute("class", "neuron-concept-importance-score-unbiased-title");
            neuronConceptImportanceScoreUnbiasedValueDiv.innerText = String(Math.round(importanceScores[1] * 100) / 100);
            neuronConceptImportanceScoreUnbiasedValueDiv.setAttribute("class", "neuron-concept-importance-score-unbiased-value");
            neuronConceptImportanceScoreBiasedDiv.appendChild(neuronConceptImportanceScoreBiasedTitleDiv);
            neuronConceptImportanceScoreBiasedDiv.appendChild(neuronConceptImportanceScoreBiasedValueDiv);
            neuronConceptImportanceScoreUnbiasedDiv.appendChild(neuronConceptImportanceScoreUnbiasedTitleDiv);
            neuronConceptImportanceScoreUnbiasedDiv.appendChild(neuronConceptImportanceScoreUnbiasedValueDiv);

            let neuronConceptPatchesTitleDiv = document.createElement("div");
            let neuronConceptPatchesImagesDiv = document.createElement("div");
            neuronConceptPatchesTitleDiv.setAttribute("class", "neuron-concept-patches-title");
            neuronConceptPatchesImagesDiv.setAttribute("class", "neuron-concept-patches-images");
            neuronConceptPatchesTitleDiv.innerText = "Concept Patches";
            neuronConceptPatchesDiv.appendChild(neuronConceptPatchesTitleDiv);
            neuronConceptPatchesDiv.appendChild(neuronConceptPatchesImagesDiv);

            let neuronConceptPatchesImagesUpperDiv = document.createElement("div");
            let neuronConceptPatchesImagesLowerDiv = document.createElement("div");
            neuronConceptPatchesImagesUpperDiv.setAttribute("class", "neuron-concept-patches-images-upper");
            neuronConceptPatchesImagesLowerDiv.setAttribute("class", "neuron-concept-patches-images-lower");
            neuronConceptPatchesImagesDiv.appendChild(neuronConceptPatchesImagesUpperDiv);
            neuronConceptPatchesImagesDiv.appendChild(neuronConceptPatchesImagesLowerDiv);

            imagePatches.forEach((patch, idx) => {
                let [imageFileName, cropPosition] = patch[0].split("-");
                let [cropX, cropY] = cropPosition.split(",");
                let neuronConceptPatchImg = document.createElement("canvas");
                neuronConceptPatchImg.setAttribute("class", "neuron-concept-patch-image");
                neuronConceptPatchImg.setAttribute("width", "30px");
                neuronConceptPatchImg.setAttribute("height", "30px");
                let ctx = neuronConceptPatchImg.getContext("2d");

                let image = new Image()
                image.src = "./assets/data/img/"+imageFileName;
                image.onload = function () {
                    ctx.drawImage(image, Number(cropX), Number(cropY), patchSize, patchSize, 0, 0, patchSize, patchSize);
                }

                if (idx < 5) neuronConceptPatchesImagesUpperDiv.appendChild(neuronConceptPatchImg);
                else neuronConceptPatchesImagesLowerDiv.appendChild(neuronConceptPatchImg);
            }) 

            // make X box to remove the window
            let neuronConceptWindowXDiv = document.createElement("div");
            neuronConceptWindowXDiv.setAttribute("class", "neuron-concept-window-x");
            neuronConceptWindowXDiv.setAttribute("id", "neuron-concept-window-x-"+layer+"-"+String(neuronId));
            neuronConceptWindowXDiv.addEventListener("click", function () {
                let thisXId = this.id.split("-");
                let thisLayer = thisXId[thisXId.length-2];
                let thisNeuronId = thisXId[thisXId.length-1];
                windowStack = windowStack.filter(d => d[0] != "neuron-concept-window-"+thisLayer+"-"+String(thisNeuronId))
                this.parentElement.remove();
            });
            neuronConceptWindow.appendChild(neuronConceptWindowXDiv);

            neuronConceptWindowXDiv = d3.select("#neuron-concept-window-x-"+layer+"-"+String(neuronId));
            let neuronConceptWindowXSvg = neuronConceptWindowXDiv.append("svg").attr("height", "30").attr("width", "30");
            neuronConceptWindowXSvg.append("line")
                .attr("class", "neuron-concept-window-x-line")
                .attr("x1", "10")
                .attr("y1", "10")
                .attr("x2", "20")
                .attr("y2", "20");
            neuronConceptWindowXSvg.append("line")
                .attr("class", "neuron-concept-window-x-line")
                .attr("x1", "20")
                .attr("y1", "10")
                .attr("x2", "10")
                .attr("y2", "20");
        }
    )

}

export function biasedSubgroupEntryHovered(e) {
    d3.select(`#${this.id}`)
        .style("border-left", "7px solid "+UNDERPERFORMING_COLOR)
        .style("background-color", "#FFE6C8")
        .select(".subgroup-entry-accuracy-value")
            .style("color", "#202020");
}

export function biasedSubgroupEntryMouseOut(e) {
    d3.select(`#${this.id}`)
        .style("border-left", "7px solid #00000000")
        .style("background-color", "")
        .select(".subgroup-entry-accuracy-value")
        .style("color", "#909090");

    if (clicked) {
        d3.select(`#biased-subgroup-${clickedId}`)
            .style("border-left", "7px solid "+UNDERPERFORMING_COLOR)
            .style("background-color", "#FFE6C8")
            .style("position", "sticky")
            .style("top", "0")
            .style("bottom", "0")
            .style("z-index", "10")
            .select(".subgroup-entry-accuracy-value")
                .style("color", "#202020");
    }
}