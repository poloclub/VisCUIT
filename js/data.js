export const getBiasedSubgroupData = () => fetch("assets/data/json/biased_subpopulations.json")
    .then(response => response.json());

export const getUnbiasedSubgroupData = () => fetch("assets/data/json/unbiased_subpopulations.json")
    .then(response => response.json());

export const getNeuronConcept = () => fetch("assets/data/json/concept_patch_per_neuron.json")
    .then(response => response.json());

export const getNeuronClusters = () => fetch("assets/data/json/neuron_clusters-0.9.json")
    .then(response => response.json());

export const LAYERS = [
    "Res2a",
    "Res2b",
    "Res2c",
    "Res3a",
    "Res3b",
    "Res3c",
    "Res3d",
    "Res4a",
    "Res4b",
    "Res4c",
    "Res4d",
    "Res4e",
    "Res4f",
    "Res5a",
    "Res5b",
    "Res5c"
];

export const UNDERPERFORMING_COLOR = "#B91B17";
export const WELLPERFORMING_COLOR = "#006C45";
export const BOTH_COLOR = "#575757";
export const VISCUIT_COLOR = "#DDAD75";


