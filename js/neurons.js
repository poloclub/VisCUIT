import { displayNeuronPath } from "./functions.js"

let neuronsDiv = document.getElementById("neurons");
let settingPanelDiv = document.createElement("div");
settingPanelDiv.setAttribute("id", "setting-panel");
let settingPanelLeft = document.createElement("div");
settingPanelLeft.setAttribute("id", 'setting-panel-left');
settingPanelDiv.appendChild(settingPanelLeft);
let neuronPathDiv = document.createElement("div");
neuronPathDiv.setAttribute("id", "neuron-path");
neuronsDiv.appendChild(settingPanelDiv);
neuronsDiv.appendChild(neuronPathDiv);

let modelInfoDiv = document.createElement("div");
modelInfoDiv.setAttribute("id", "model-info");
modelInfoDiv.setAttribute("class", "info");
settingPanelLeft.appendChild(modelInfoDiv);
let modelInfoTitleDiv = document.createElement("div");
let modelInfoContentDiv = document.createElement("div");
modelInfoTitleDiv.setAttribute("id", "model-info-title");
modelInfoTitleDiv.setAttribute("class", "setting-title");
modelInfoContentDiv.setAttribute("id", "model-info-content");
modelInfoContentDiv.setAttribute("class", "setting-content");
modelInfoTitleDiv.innerText = "Model";
modelInfoContentDiv.innerText = "ResNet50";
modelInfoDiv.appendChild(modelInfoTitleDiv);
modelInfoDiv.appendChild(modelInfoContentDiv);

let datasetInfoDiv = document.createElement("div");
datasetInfoDiv.setAttribute("id", "dataset-info");
datasetInfoDiv.setAttribute("class", "info");
settingPanelLeft.appendChild(datasetInfoDiv);
let datasetInfoTitleDiv = document.createElement("div");
let datasetInfoContentDiv = document.createElement("div");
datasetInfoTitleDiv.setAttribute("id", "dataset-info-title");
datasetInfoTitleDiv.setAttribute("class", "setting-title");
datasetInfoContentDiv.setAttribute("id", "dataset-info-content");
datasetInfoContentDiv.setAttribute("class", "setting-content");
datasetInfoTitleDiv.innerText = "Dataset";
datasetInfoContentDiv.innerText = "Biased CelebA";
datasetInfoDiv.appendChild(datasetInfoTitleDiv);
datasetInfoDiv.appendChild(datasetInfoContentDiv);

let accuracyInfoDiv = document.createElement("div");
accuracyInfoDiv.setAttribute("id", "accuracy-info");
accuracyInfoDiv.setAttribute("class", "info");
settingPanelLeft.appendChild(accuracyInfoDiv);
let accuracyInfoTitleDiv = document.createElement("div");
let accuracyInfoContentDiv = document.createElement("div");
accuracyInfoTitleDiv.setAttribute("id", "accuracy-info-title");
accuracyInfoTitleDiv.setAttribute("class", "setting-title");
accuracyInfoContentDiv.setAttribute("id", "accuracy-info-content");
accuracyInfoContentDiv.setAttribute("class", "setting-content");
accuracyInfoTitleDiv.innerText = "Accuracy";
accuracyInfoContentDiv.innerText = "92.1%";  // 18381/19961
accuracyInfoDiv.appendChild(accuracyInfoTitleDiv);
accuracyInfoDiv.appendChild(accuracyInfoContentDiv);

let settingThresholdDiv = document.createElement("div");
settingThresholdDiv.setAttribute("id", "setting-threshold");
settingThresholdDiv.setAttribute("class", "info");
settingPanelLeft.appendChild(settingThresholdDiv);
let settingThresholdHeaderDiv = document.createElement("div");
let settingThresholdSliderDiv = document.createElement("div");
settingThresholdHeaderDiv.setAttribute("id", "setting-threshold-title");
settingThresholdHeaderDiv.setAttribute("class", "setting-title")
settingThresholdSliderDiv.setAttribute("id", "setting-threshold-slider-frame")
settingThresholdSliderDiv.setAttribute("class", "setting-content")
settingThresholdDiv.appendChild(settingThresholdHeaderDiv);
settingThresholdDiv.appendChild(settingThresholdSliderDiv);

let settingThresholdSliderMinValue = document.createElement("div");
let settingThresholdSliderMaxValue = document.createElement("div");
let settingThresholdSliderInput = document.createElement("input");
settingThresholdSliderMinValue.setAttribute("id", "setting-threshold-slider-min-value");
settingThresholdSliderMaxValue.setAttribute("id", "setting-threshold-slider-max-value");
settingThresholdSliderMinValue.innerText = "0.5";
settingThresholdSliderMaxValue.innerText = "1.0";
settingThresholdSliderInput.setAttribute("type", "range");
settingThresholdSliderInput.setAttribute("min", "5");
settingThresholdSliderInput.setAttribute("max", "10");
settingThresholdSliderInput.setAttribute("value", "5");
settingThresholdSliderInput.setAttribute("id", "setting-threshold-slider");
settingThresholdSliderDiv.appendChild(settingThresholdSliderMinValue);
settingThresholdSliderDiv.appendChild(settingThresholdSliderInput);
settingThresholdSliderDiv.appendChild(settingThresholdSliderMaxValue);

let settingThresholdTitleDiv = document.createElement("div");
let settingThresholdValueDiv = document.createElement("div");
settingThresholdTitleDiv.innerText = "Importance Threshold";
settingThresholdValueDiv.innerText = String(settingThresholdSliderInput.value/10);
settingThresholdTitleDiv.setAttribute("id", "setting-threshold-title-text");
settingThresholdValueDiv.setAttribute("id", "setting-threshold-value");
settingThresholdHeaderDiv.appendChild(settingThresholdTitleDiv);

let iconDiv = document.createElement("div");
iconDiv.setAttribute('id', 'icon-container');
settingPanelDiv.appendChild(iconDiv);

let linkContainer = document.createElement("a");
linkContainer.setAttribute("href", "https://github.com/poloclub/VisCUIT");
let headerIconImg = document.createElement("img");
headerIconImg.setAttribute("src", "assets/logo/github-brands.svg");
linkContainer.appendChild(headerIconImg);
iconDiv.appendChild(linkContainer);

linkContainer = document.createElement("a");
linkContainer.setAttribute("href", "https://github.com/poloclub/VisCUIT");
headerIconImg = document.createElement("img");
headerIconImg.setAttribute("src", "assets/logo/youtube-brands.svg");
linkContainer.appendChild(headerIconImg);
iconDiv.appendChild(linkContainer);

settingThresholdSliderInput.addEventListener("input", (e) => {
    settingThresholdValueDiv.innerText = String(settingThresholdSliderInput.value/10);
    let neuronPathDiv = document.getElementById("neuron-path");
    if (neuronPathDiv.hasChildNodes()) {
        neuronPathDiv.innerHTML = '';
        // delete all the windows that are displayed
        let gradcamWindowDiv = document.getElementById("selected-image-clicked-window");
        let conceptPatchWindowDivs = document.getElementsByClassName("neuron-concept-window");

        if (gradcamWindowDiv) gradcamWindowDiv.remove();

        let conceptPatchWindowNumber = conceptPatchWindowDivs.length;
        for (let idx = 0 ; idx < conceptPatchWindowNumber ; idx++) {
            conceptPatchWindowDivs[0].remove();
        }

        let selectedBiasedSubgroupDiv = document.getElementsByClassName("selected-biased-subgroup")[0];
        let similarUnbiasedSubgroupDiv = document.getElementById("similar-unbiased-subgroup")

        let selectedBiasedSubgroupInfo = selectedBiasedSubgroupDiv.biasedSubgroupInfo;
        let similarUnbiasedSubgroupInfo = similarUnbiasedSubgroupDiv.unbiasedSubgroupInfo;
        let newIdNumber = similarUnbiasedSubgroupDiv.newIdNumber;
        displayNeuronPath(selectedBiasedSubgroupInfo, similarUnbiasedSubgroupInfo, newIdNumber);
    }
});