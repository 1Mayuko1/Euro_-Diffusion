const dataCountry = `
3
France 1 4 4 6
Spain 3 1 6 3
Portugal 1 1 2 2
1
Luxembourg 1 1 1 1
2
Netherlands 1 3 2 4
Belgium 1 1 2 2
0
`

class Country {
    constructor(name) {
        this.name = name;
        this.cities = [];
        this.full = 0;
        this.day_of_full = 0;
    }

    setCity(city) {
        this.cities.push(city);
    }

    onFullness(day) {
        if (this.full) {
            return;
        }
        for (const city of this.cities) {
            if (!city.full) {
                return;
            }
        }
        this.full = true;
        this.day_of_full = day;
    }

    onCountry() {
        this.full = true;
        this.day_of_full = 0;
    }
}

class City {
    constructor(country_name, countries_list, x, y) {
        this.country_name = country_name;
        this.x = x;
        this.y = y;
        this.balance = {};
        for (const city_data of countries_list) {
            this.balance[city_data.name] = 0;
        }
        this.balance[country_name] = 1000000;
        this.balance_per_day = {};
        for (const city_data of countries_list) {
            this.balance_per_day[city_data.name] = 0;
        }
        this.neighbours = [];
        this.full = 0;
    }

    neighboursValue(neighbours) {
        this.neighbours = neighbours;
    }

    neighboursPass() {
        for (const motif in this.balance) {
            const onBalanceValue = Number(this.balance[motif]);
            const neighboursPassValue = Math.floor(onBalanceValue / 1000);
            if (neighboursPassValue > 0) {
                for (const neighbour of this.neighbours) {
                    this.balance[motif] -= neighboursPassValue;
                    neighbour.onBalance(motif, neighboursPassValue);
                }
            }
        }
    }

    onBalance(motif, amount) {
        this.balance_per_day[motif] += amount;
    }

    formatModeByDay() {
        for (const motif in this.balance_per_day) {
            this.balance[motif] += this.balance_per_day[motif];
            this.balance_per_day[motif] = 0;
        }

        if (!this.full) {
            for (const motif in this.balance_per_day) {
                if (this.balance[motif] === 0) {
                    return;
                }
            }
            this.full = true;
        }
    }
}

function parseCountry(line) {
    const args = line.split(' ');
    if (args.length !== 5) {
        throw new Error(`Error at line ${line}: invalid number of tokens`);
    }
    const namePattern = /^[A-Z][a-z]{1,24}$/;
    if (!namePattern.test(args[0])) {
        throw new Error(`Error at line ${line}: invalid country name`);
    }
    for (let i = 1; i < args.length; i++) {
        if (parseInt(args[i]) <= 0 || parseInt(args[i]) >= 10 + 1) {
            throw new Error(`Error at line ${line}: invalid country coordinates`);
        }
    }

    return {
        name: args[0],
        ll: { x: parseInt(args[1]), y: parseInt(args[2]) },
        ur: { x: parseInt(args[3]), y: parseInt(args[4]) },
    };
}

function getData() {
    const cases = [];

    const lines = dataCountry.split('\n');
    let lineIndex = 0;
    let caseNumber = 1;
    while (lineIndex < lines.length) {
        const countriesLen = parseInt(lines[lineIndex].trim());
        if (countriesLen === 0) {
            return cases.slice();
        }
        if (countriesLen > 20 || countriesLen < 1) {
            throw new Error(`Error in input for case ${caseNumber}: invalid amount of countries`);
        }
        lineIndex++;

        const countriesList = [];
        for (let i = 0; i < countriesLen; i++) {
            const parsed = parseCountry(lines[lineIndex]);
            countriesList.push(parsed);
            lineIndex++;
        }
        caseNumber++;
        cases.push(countriesList);
    }

    return cases.slice();
}

module.exports = { parseInput: getData };

class MarkingType {
    constructor(countries_data) {
        this.countries = [];
        this.grid = Array.from({ length: 10 + 2 }, () => new Array(10 + 2).fill(null));
        this.setGrid(countries_data);
        this.onNeighbours();
    }

    onIntersection() {
        for (let i = 0; i < this.countries.length - 1; i++) {
            const countryA = this.countries[i];
            for (let j = i + 1; j < this.countries.length; j++) {
                const countryB = this.countries[j];
                for (const cityA of countryA.cities) {
                    for (const cityB of countryB.cities) {
                        if (cityA.x === cityB.x && cityA.y === cityB.y) {
                            throw new Error(`${countryA.name} intersects with ${countryB.name} on [${cityA.x}, ${cityA.y}]`);
                        }
                    }
                }
            }
        }
    }

    __diffusion() {
        if (this.countries.length === 1) {
            this.countries[0].onCountry();
            return;
        }

        let full = false;
        let day = 1;

        while (!full) {
            for (let x = 0; x <= 10; x++) {
                for (let y = 0; y <= 10; y++) {
                    if (this.grid[x][y] !== null) {
                        const city = this.grid[x][y];
                        city.neighboursPass();
                    }
                }
            }

            for (let x = 0; x <= 10; x++) {
                for (let y = 0; y <= 10; y++) {
                    if (this.grid[x][y] !== null) {
                        const city = this.grid[x][y];
                        city.formatModeByDay();
                    }
                }
            }

            full = true;

            for (const country of this.countries) {
                country.onFullness(day);

                if (!country.full) {
                    full = false;
                }
            }

            day++;
        }

        this.countries.sort((a, b) => a.day_of_full - b.day_of_full);
    }

    setGrid(countries_data) {
        for (const countryData of countries_data) {
            const country = new Country(countryData.name);

            for (let x = countryData.ll.x; x <= countryData.ur.x; x++) {
                for (let y = countryData.ll.y; y <= countryData.ur.y; y++) {
                    if (this.grid[x][y] !== null) {
                        throw new Error(`${this.grid[x][y].country_name} intersects with ${country.name} on [${x}, ${y}]`);
                    }

                    const city = new City(country.name, countries_data, x, y);
                    this.grid[x][y] = city;
                    country.setCity(city);
                }
            }

            this.countries.push(country);
        }

        for (const row of this.grid) {
            for (const city of row) {
                if (city !== null) {
                    const neighboursList = this.neighboursData(city.x, city.y);
                    city.neighboursValue(neighboursList);
                }
            }
        }

        this.onIntersection();
    }

    neighboursData(x, y) {
        const neighbours = [];

        if (this.grid[x][y + 1] !== null) {
            neighbours.push(this.grid[x][y + 1]);
        }

        if (this.grid[x][y - 1] !== null) {
            neighbours.push(this.grid[x][y - 1]);
        }

        if (this.grid[x + 1][y] !== null) {
            neighbours.push(this.grid[x + 1][y]);
        }

        if (this.grid[x - 1][y] !== null) {
            neighbours.push(this.grid[x - 1][y]);
        }

        return neighbours;
    }

    onNeighbours() {
        if (this.countries.length <= 1) {
            return;
        }
        for (const country of this.countries) {
            if (country.cities.some(city => city.neighbours.some(neighbour => neighbour.country_name !== country.name)) === false) {
                throw new Error(`${country.name} has no connection with other countries`);
            }
        }
    }
}

const cases = getData();
for (let i = 0; i < cases.length; i++) {
    const countries_list = cases[i];
    if (countries_list.length > 0) {
    console.log(`\nCase Number ${(i + 1) -1}`);
        try {
            const europe_map = new MarkingType(countries_list);
            europe_map.__diffusion();
            for (const country of europe_map.countries) {
                console.log(country.name, country.day_of_full);
            }
        } catch (error) {
            if (!(error instanceof Error)) throw error;
        }
    }
}
