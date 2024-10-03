const geminiSystemInstruction = `
  You are narrator in a text-based game that takes place in a dark fantasy setting. 
  Game will be spinning around village with surviving heroes in this cruel world. 
  You will be asked to narrate events for the village and heroes, generate interesting,
  mysterious biographies for heroes. 
  You should be fair narrator, sometimes cruel, sometimes kind, but always interesting.
`;

const heroEventEnemyPrompt = (type, name, gender, currentHp, attack) => `
Generate a unique situation for the character which has 
Class: ${type} 
Name: "${name}" 
Gender: ${gender} 
Current HP: ${currentHp}
Attack Power ${attack}
This character is one of the survivors in a cruel dark fantasy world and is
leaving the village to find supplies. Create a story describing what this character
is doing when they go outside the village, and conclude the story with an
encounter with an enemy. Generate the enemy's name, hp, and attack. After that,
provide three options for the hero to choose from.
Finally, generate results for each of those options. The results should include
a description of what happened when the hero chose that option, how many hp were lost,
and how much supplies were found. Ensure that the results describe the
conclusion of the event with no further story continuation. Ensure everything follows this JSON schema:

{
  "eventSetup": {
    "eventStory": "str",
    "enemy": {
      "name": "str",
      "attack": "int",
      "hp": "int"
    }
  },
  "options": [
    {
      "option": "str",
      "result": {
        "desc": "str",
        "hpDelta": "int",
        "suppliesDelta": "int"
      }
    }
  ]
}
`;

const heroEventNoEnemyPrompt = (type, name, gender, currentHp, attack) => `
Generate a unique situation for the character with the following details:
Class: ${type}
Name: "${name}"
Gender: ${gender} 
Current HP: ${currentHp}
Attack Power: ${attack}

This character is one of the survivors in a cruel dark fantasy world and is 
leaving the village to find supplies. Generate an event that does not 
include enemy encounters but requires the player to make morally complex choices. 
Provide the event story, followed by three options for what the hero can do, and 
include a description of the outcome for each option. Each event result should 
affect the current HP of the hero, supplies.
Ensure everything follows this JSON schema:

{
  "eventSetup": {
    "eventStory": "str"
  },
  "options": [
    {
      "option": "str",
      "result": {
        "desc": "str",
        "hpDelta": "int",
        "suppliesDelta": "int"
      }
    }
  ]
}
`;

const villageEventTimerPrompt = (supplies) => `
Generate a unique event for a village inhabited by heroes in a cruel dark fantasy world. You should create 
a situation where the village is facing a crisis and the heroes must make a difficult decision.
The village has the following attributes:
Supplies: ${supplies}

Create three distinct and grim event options for the village. 
Each option should be unique and potentially cruel.
After presenting the options, generate the outcomes for each. 
The outcomes should include a detailed description of what happened and 
indicate changes in the village's supplies.
Ensure that all outputs follow this JSON schema:

{
  "eventSetup": {
    "eventStory": "str"
  },
  "options": [
    {
      "option": "str",
      "result": {
        "desc": "str",
        "suppliesDelta": "int"
      }
    }
  ]
}
`;

const heroGeneratePrompt = (gender, type, chibiDesc) => `
Generate a name and bio for a 
${gender} 
hero of class ${type}. Description of this hero: ${chibiDesc}.
set in a dark fantasy world. This is a cruel world where everyone tries to survive after a mysterious calamity. 
The bio should be not exceeding 100 words. Use the following JSON schema:

{
  "name": "string",
  "bio": "string"
}
`;

module.exports = {
  geminiSystemInstruction,
  heroEventEnemyPrompt,
  heroEventNoEnemyPrompt,
  villageEventTimerPrompt,
  heroGeneratePrompt,
};
