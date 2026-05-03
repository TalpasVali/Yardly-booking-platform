export interface SearchState {
    searchBarInterface: SearchbarInterface | null;
    loading: boolean;
}
export interface SearchbarInterface {
    sport: string;
    city: string;
    date: string;
    time: string;
}

export const initialSearchState: SearchState = {
    searchBarInterface: null,
    loading: false
};