/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/?(*.)+(spec|test).ts"], // מחפש קבצים שמסתיימים ב-.test.ts
    moduleFileExtensions: ["ts", "js", "json", "node"],
};