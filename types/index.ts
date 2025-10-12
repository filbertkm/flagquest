export interface Country {
	id: string;
	name: string;
	flag: string;
	aliases?: string[];
}

export interface GameRound {
	country: Country;
	correct: boolean;
	userGuess: string;
}

export interface SuggestionItem {
	country: Country;
	displayText: string;
}
