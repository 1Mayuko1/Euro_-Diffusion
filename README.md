# Euro_Diffusion

Euro Diffusion is a classic optimization problem that involves finding the optimal way to distribute euro coins to a set of countries. The problem is named after the process of introducing the euro currency across the European Union.

In the Euro Diffusion problem, a set of countries are given, and each country has a population and a target amount of euro coins to be distributed. The task is to determine the optimal way to distribute the coins among the countries, while minimizing the number of days required to reach the target amount for each country.

The problem is usually formulated as a mathematical optimization problem and can be solved using various algorithms, such as linear programming or dynamic programming. It is a well-known problem in the field of operations research and has many real-world applications, such as resource allocation, production planning, and supply chain management.

## Input data and Usage
The input for this problem contains multiple test cases, each consisting of a number of countries and their respective coordinates. Each country is described by its name, as well as the coordinates of its most southwestward and most northeastward cities. The input ends with a single zero. The constraints for the input are as follows: the number of countries is between 1 and 20, the coordinates of each city range from 1 to 10, and the lower left coordinates of each country are always less than or equal to the upper right coordinates. This problem is commonly known as the Euro Diffusion problem and is used to determine the optimal way to distribute euro coins among a set of countries. The problem has many real-world applications, such as resource allocation and production planning.

Just insert several example countries into a variable dataCountry and run the code.

```js
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
```

## Result for data in Input

```js
`Case Number 1
Spain 382
Portugal 416
France 1325

Case Number 2
Luxembourg 0

Case Number 3
Netherlands 2
Belgium 2
`
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)

