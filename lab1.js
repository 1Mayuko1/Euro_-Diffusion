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

function validateInput(input) {
    // Перевірка, чи є вхідні дані рядком
    if (typeof input !== "string") {
        throw new Error("Вхідні дані мають бути рядком!");
    }

    // Розділення вхідного рядка на тести
    const tests = input.trim().split("\n0\n");

    // Перевірка, чи кількість тестів не менше 1 та не більше 100
    if (tests.length < 1 || tests.length > 100) {
        throw new Error("Кількість тестів має бути від 1 до 100!");
    }

    // Перевірка кожного тесту
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];

        // Розділення тесту на рядки
        const lines = test.trim().split("\n");

        // Перевірка, чи містить тест число країн
        const numCountries = Number(lines[0]);
        if (isNaN(numCountries)) {
            throw new Error(`Тест ${i + 1}: Кількість країн має бути числом!`);
        }

        // Перевірка, чи кількість рядків відповідає кількості країн
        if (lines.length - 1 !== numCountries) {
            throw new Error(`Тест ${i + 1}: Кількість країн не відповідає вхідним даним!`);
        }

        // Перевірка, чи кожен рядок містить правильну кількість значень
        for (let j = 1; j < lines.length; j++) {
            const [name, xl, yl, xh, yh] = lines[j].split(" ");
            if (isNaN(xl) || isNaN(yl) || isNaN(xh) || isNaN(yh)) {
                throw new Error(`Тест ${i + 1}, країна ${name}: Координати мають бути числами!`);
            }
            if (name.length > 25) {
                throw new Error(`Тест ${i + 1}, країна ${name}: Назва має бути не більше 25 символів!`);
            }
            if (xl < 1 || xl > 10 || xh < 1 || xh > 10 || yl < 1 || yl > 10 || yh < 1 || yh > 10) {
                throw new Error(`Тест ${i + 1}, країна ${name}: Координати мають бути від 1 до 10!`);
            }
            if (xl >= xh || yl >= yh) {
                throw new Error(`Тест ${i + 1}, країна ${name}: Межі країни задані неправильно!`);
            }
        }
    }
}

class Country {
    constructor(name) {
        this.name = name;
        this.cities = []; // масив міст у країні
        this.full = 0; // прапорець заповненості країни
        this.day_of_full = 0; // день, коли країна заповнилась
    }

    // метод для додавання міста у країну
    setCity(city) {
        this.cities.push(city);
    }

    // метод для перевірки заповненості країни
    onFullness(day) {
        // якщо країна вже заповнена, то виходимо з методу
        if (this.full) {
            return;
        }

        // перевіряємо кожне місто в країні
        for (const city of this.cities) {
            // якщо місто не заповнене, то країна не заповнена, виходимо з методу
            if (!city.full) {
                return;
            }
        }

        // якщо кожне місто в країні заповнене, то встановлюємо прапорець заповненості країни та зберігаємо день
        this.full = true;
        this.day_of_full = day;
    }

    // метод для встановлення прапорця заповненості країни та занулення дня заповнення
    onCountry() {
        this.full = true;
        this.day_of_full = 0;
    }
}

class City {
    constructor(country_name, countries_list, x, y) {
        this.country_name = country_name; // назва країни, до якої належить місто
        this.x = x; // координата x міста
        this.y = y; // координата y міста
        this.balance = {}; // баланс міста по країнах
        for (const city_data of countries_list) {
            this.balance[city_data.name] = 0;
        }
        this.balance[country_name] = 1000000; // початковий баланс міста у відповідній країні
        this.balance_per_day = {}; // баланс міста по країнах на день
        for (const city_data of countries_list) {
            this.balance_per_day[city_data.name] = 0;
        }
        this.neighbours = []; // масив сусідів міста
        this.full = 0; // прапорець заповненості міста
    }

    // метод для встановлення сусідів міста
    neighboursValue(neighbours) {
        this.neighbours = neighbours;
    }

    // метод для передачі балансу між сусідніми містами
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

    // метод для зберігання балансу, переданого з сусідніх міст
    onBalance(motif, amount) {
        this.balance_per_day[motif] += amount;
    }

    // метод для визначення заповненості міста на день
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
// Розбиваємо рядок на масив аргументів
    const args = line.split(' ');
    // Перевіряємо, чи правильна кількість аргументів
    if (args.length !== 5) {
        throw new Error(`Помилка у рядку ${line}: неправильна кількість аргументів`);
    }

// Вираз для перевірки, чи ім'я країни відповідає формату
    const namePattern = /^[A-Z][a-z]{1,24}$/;

// Перевіряємо, чи ім'я країни відповідає формату
    if (!namePattern.test(args[0])) {
        throw new Error(`Помилка у рядку ${line}: неправильне ім'я країни`);
    }

// Перевіряємо, чи координати країни відповідають формату
    for (let i = 1; i < args.length; i++) {
        if (parseInt(args[i]) <= 0 || parseInt(args[i]) >= 10 + 1) {
            throw new Error(`Помилка у рядку ${line}: неправильні координати країни`);
        }
    }

// Повертаємо об'єкт з ім'ям країни та її координатами у відповідному форматі
    return {
        name: args[0],
        ll: {x: parseInt(args[1]), y: parseInt(args[2])},
        ur: {x: parseInt(args[3]), y: parseInt(args[4])},
    };
}

function getData() {
    const cases = [];
    const lines = dataCountry.split('\n');
    let lineIndex = 0;
    let caseNumber = 1;

// Проходимо по рядках вхідних даних та створюємо список тестових випадків
    while (lineIndex < lines.length) {

        // Отримуємо кількість країн для поточного тестового випадку
        const countriesLen = parseInt(lines[lineIndex].trim());

        // Перевіряємо, що кількість країн відповідає допустимому діапазону значень
        if (countriesLen === 0) {
            return cases.slice();
        }
        if (countriesLen > 20 || countriesLen < 1) {
            throw new Error(`Помилка у вводі для випадку ${caseNumber}: неправильна кількість країн`);
        }
        lineIndex++;

        // Розбиваємо вхідні дані на країни та додаємо до поточного тестового випадку
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
        // Створити порожній масив країн та двовимірний масив для зберігання міток
        this.countries = [];
        this.grid = Array.from({ length: 10 + 2 }, () => new Array(10 + 2).fill(null));

        // Встановити мітки для кожної клітинки відповідно до країни, яка її містить
        this.setGrid(countries_data);

        // Встановити список сусідів для кожного міста в кожній країні
        this.onNeighbours();
    }
    // Перевірити, чи перетинаються будь-які дві країни в будь-якому місці
    onIntersection() {
        for (let i = 0; i < this.countries.length - 1; i++) {
            const countryA = this.countries[i];
            for (let j = i + 1; j < this.countries.length; j++) {
                const countryB = this.countries[j];
                for (const cityA of countryA.cities) {
                    for (const cityB of countryB.cities) {
                        if (cityA.x === cityB.x && cityA.y === cityB.y) {
                            // Якщо дві країни перетинаються в будь-якому місці, генерувати помилку
                            throw new Error(`${countryA.name} перетинається з ${countryB.name} на координатах [${cityA.x}, ${cityA.y}]`);
                        }
                    }
                }
            }
        }
    }

    __diffusion() {
        // Якщо кількість країн 1, то виконуємо розрахунки лише для неї та повертаємо результат
        if (this.countries.length === 1) {
            this.countries[0].onCountry();
            return;
        }

        let full = false;
        let day = 1;

        // Поки хоча б одна країна не заповнена, продовжуємо розрахунки
        while (!full) {
            // Проходимо по кожній клітинці і передаємо значення сусіднім клітинкам
            for (let x = 0; x <= 10; x++) {
                for (let y = 0; y <= 10; y++) {
                    if (this.grid[x][y] !== null) {
                        const city = this.grid[x][y];
                        city.neighboursPass();
                    }
                }
            }

            // Проходимо по кожній клітинці і оновлюємо її значення за поточний день
            for (let x = 0; x <= 10; x++) {
                for (let y = 0; y <= 10; y++) {
                    if (this.grid[x][y] !== null) {
                        const city = this.grid[x][y];
                        city.formatModeByDay();
                    }
                }
            }

            // Перевіряємо, чи заповнені всі країни
            full = true;
            for (const country of this.countries) {
                country.onFullness(day);

                if (!country.full) {
                    full = false;
                }
            }

            day++;
        }

        // Сортуємо країни за днем заповнення та повертаємо результат
        this.countries.sort((a, b) => a.day_of_full - b.day_of_full);
    }

    setGrid(countries_data) {
        // Ітерація по країнах
        for (const countryData of countries_data) {
            // Створення об'єкту країни
            const country = new Country(countryData.name);
            // Ітерація по координатам, які займає країна
            for (let x = countryData.ll.x; x <= countryData.ur.x; x++) {
                for (let y = countryData.ll.y; y <= countryData.ur.y; y++) {
                    // Перевірка, чи дана точка не зайнята іншою країною
                    if (this.grid[x][y] !== null) {
                        throw new Error(`${this.grid[x][y].country_name} перетинається з ${country.name} на [${x}, ${y}]`);
                    }

                    // Створення об'єкту міста та його додавання в сітку та країну
                    const city = new City(country.name, countries_data, x, y);
                    this.grid[x][y] = city;
                    country.setCity(city);
                }
            }

            // Додавання країни в список країн
            this.countries.push(country);
        }

        // Обчислення сусідів для кожного міста
        for (const row of this.grid) {
            for (const city of row) {
                if (city !== null) {
                    const neighboursList = this.neighboursData(city.x, city.y);
                    city.neighboursValue(neighboursList);
                }
            }
        }

        // Перевірка перетинів країн
        this.onIntersection();
    }

    // Функція повертає список сусідів міста за координатами x та y
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

    // Функція перевіряє, щоб кожна країна мала з'єднання з іншими країнами за допомогою хоча б одного міста
    onNeighbours() {
        if (this.countries.length <= 1) {
            return;
        }
        for (const country of this.countries) {
            // Перевіряємо, щоб кожне місто країни мало хоча б одного сусіда з іншої країни
            if (country.cities.some(city => city.neighbours.some(neighbour => neighbour.country_name !== country.name)) === false) {
                throw new Error(`${country.name} не має зв'язку з іншими країнами`);
            }
        }
    }
}

// Отримуємо список країн з даних користувача
const cases = getData();

// Ітеруємося по кожному списку країн
for (let i = 0; i < cases.length; i++) {

    // Отримуємо список країн для поточного тестового випадку
    const countries_list = cases[i];

    // Якщо список країн не порожній
    if (countries_list.length > 0) {

        // Виводимо номер поточного тестового випадку
        console.log(`\nCase Number ${i}`);

        try {
            // Створюємо об'єкт типу MarkingType із заданим списком країн
            const europe_map = new MarkingType(countries_list);

            // Запускаємо алгоритм розсіювання
            europe_map.__diffusion();

            // Для кожної країни виводимо назву та день повного заповнення
            for (const country of europe_map.countries) {
                console.log(country.name, country.day_of_full);
            }
        } catch (error) {
            // Якщо сталася помилка, виводимо повідомлення про неї
            if (!(error instanceof Error)) throw error;
        }
    }
}
