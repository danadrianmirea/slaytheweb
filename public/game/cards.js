import {uuid} from './utils.js'
import actionsMethods from './actions.js'
import conditionsMethods from './conditions.js'

// This file contains all the cards in the game as well as a few utility methods.
// While cards are described in this object form, they are always converted to a class equivalent.
// All our cards.

export const cards = [
	{
		name: 'Defend',
		type: 'Skill',
		energy: 1,
		block: 5,
		target: 'player',
		description: 'Gain 5 Block'
	},
	{
		name: 'Strike',
		type: 'Attack',
		energy: 1,
		target: 'enemy',
		damage: 6,
		description: 'Deal 6 Damage.'
	},
	{
		name: 'Bash',
		type: 'Attack',
		energy: 2,
		damage: 8,
		target: 'enemy',
		powers: {
			vulnerable: 2,
		},
		description: 'Deal 8 damage. Apply 2 Vulnerable.',
	},
	{
		name: 'Clash',
		type: 'Attack',
		energy: 0,
		damage: 14,
		target: 'enemy',
		conditions: [
			{
				action: 'onlyType',
				type: 'Attack'
			}
		],
		  
		description: 'Can only be played if every card in your hand is an Attack. Deal 14 damage.',
	},
	{
		name: 'Cleave',
		type: 'Attack',
		energy: 1,
		damage: 8,
		target: 'all enemies',
		description: 'Deal 8 damage to ALL enemies.',
	},
	{
		name: 'Iron Wave',
		type: 'Skill',
		energy: 1,
		damage: 5,
		block: 5,
		target: 'enemy',
		description: 'Gain 5 Block. Deal 5 damage.',
	},
	{
		name: 'Sucker Punch',
		type: 'Attack',
		energy: 1,
		damage: 7,
		target: 'enemy',
		powers: {
			weak: 1,
		},
		description: 'Deal 7 damage. Apply 1 Weak.',
	},
	{
		name: 'Thunderclap',
		type: 'Attack',
		energy: 1,
		damage: 4,
		target: 'all enemies',
		powers: {
			vulnerable: 1,
		},
		description: 'Deal 4 damage and apply 1 Vulnerable to all enemies.',
	},
	{
		name: 'Flourish',
		type: 'Skill',
		energy: 2,
		target: 'player',
		description: 'Gain 5 regen. Can only be played if player is under 50% health',
		conditions: [
			{
				action: 'shouldNotHaveMoreThen',
				percentage: 50
			}
		],
		powers: {
			regen: 5,
		},
	},
	{
		name: 'Summer of Sam',
		type: 'Skill',
		energy: 0,
		target: 'player',
		description: 'Gain 1 HP and draw 2 cards',
		onUse: [
			{
				action: 'addHealth',
				parameter: {
					target: 'playerX',
					amount: 1
				}
			},
			{
				action: 'drawCards',
				preConditions: [
					{
						action: 'shouldNotHaveLessThen',
						percentage: 100
					}
				],
				parameter: 2
			}
		],
		conditions: [
			{
				action: 'onlyType',
				type: 'Skill'
			},
			{
				action: 'shouldNotHaveLessThen',
				percentage: 60
			}
		]
	}
	// {name: 'Flex', energy: 0, type: 'Skill', description: 'Gain 2 Strength.'},
	// {name: 'Body Slam', energy: 1, type: 'Attack', description: 'Deal Damage equal to your Block'},
]

function checkConditions(conditions, state) {
	let boolean = false;
	if (conditions && state) {
		conditions.forEach(condition => {
			if (!boolean && conditionsMethods[condition.action]) {
				boolean = conditionsMethods[condition.action](state, condition)
			}
		});
	}

	return boolean
}

function runOnUse(actions, state, target) {
	let newState = state;

	if (actions && state) {
		actions.forEach(onUse => {

			if (onUse.preConditions && checkConditions(onUse.preConditions, state)) {
				return newState;
			}

			// Trick to replace the target in the parameters
			// It creates problem now 
			// TODO fix it
			let param = onUse.parameter;
			// if (onUse.parameter.target) {
			// 	delete onUse.parameter.target
			// 	param = {
			// 		target,
			// 		...onUse.parameter
			// 	}
			// }
			newState = actionsMethods[onUse.action](newState, param)
		});
	}

	return newState
}


// All cards extend this class.
export class Card {
	constructor(props) {
		this.id = uuid()
		this.name = props.name
		this.type = props.type
		this.energy = props.energy
		this.target = props.target
		this.damage = props.damage
		this.block = props.block
		this.powers = props.powers
		this.description = props.description
		this.conditions = props.conditions
		this.onUse = props.onUse

		this.use = (state, target) => {
			return runOnUse(this.onUse, state, target)
		}
		this.condition = (state) => {
			return checkConditions(this.conditions, state)
		};
	}
}

// Turns a plain object card into a class-based one.
// We do this so we can define the cards without using class syntax.
export function createCard(name) {
	const baseCard = cards.find((card) => card.name === name)
	if (!baseCard) throw new Error(`Card not found: ${name}`)
	return new Card(baseCard)
}

// Returns X amount of random cards.
export function getRandomCards(amount = 3) {
	const cardNames = cards.map((card) => card.name)
	let results = []
	for (let i = 0; i < amount; i++) {
		const randomIndex = Math.floor(Math.random() * cardNames.length)
		const name = cardNames[randomIndex]
		const card = createCard(name)
		results.push(card)
	}
	return results
}

// this.card = {
// 	name: enum,
// 	type: enum, // [ATTACK, SKILL, POWER, STATUS, CURSE]
// 	energy: number,
// 	target: enum, // [ENEMY, ALL_ENEMY, PLAYER, NONE, SELF_AND_ENEMY, ALL]
// 	description: string,
// 	powers: {
// 		regen: number,
// 		vulnerable: number,
// 		weak: number
// 	},
// 	conditions: [
// 		{
// 			action: enum,
// 			type: enum
// 		}
// 	]
// }
// color = [RED, GREEN, BLUE, PURPLE, COLORLESS, CURSE]
// rarity = [BASIC, SPECIAL, COMMON, UNCOMMON, RARE, CURSE]
