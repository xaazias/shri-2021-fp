import { round, toNumber, toString } from "lodash"

import {
  __,
  andThen,
  allPass,
  assoc,
  concat,
  compose,
  gt,
  ifElse,
  length,
  lt,
  modulo,
  otherwise,
  prop,
  tap,
  test
} from "ramda"

import Api from "../tools/api"

/**
 * @file Домашка по FP ч. 2
 *
 * Подсказки:
 * Метод get у инстанса Api – каррированый
 * GET / https://animals.tech/{id}
 *
 * GET / https://api.tech/numbers/base
 * params:
 * – number [Int] – число
 * – from [Int] – из какой системы счисления
 * – to [Int] – в какую систему счисления
 *
 * Иногда промисы от API будут приходить в состояние rejected, (прямо как и API в реальной жизни)
 * Ответ будет приходить в поле {result}
 */

const api = new Api()

const processSequence = ({ value, writeLog, handleSuccess, handleError }) => {
  /** Greater */
  const greaterThanTwo = gt(__, 2)
  const greaterThanZero = gt(__, 0)

  /** Less */
  const lessThanTen = lt(__, 10)

  /** Operations */
  const matchesNumberPattern = test(/^[0-9]+(\.[0-9]+)?$/)
  const isPositive = compose(greaterThanZero, parseFloat)
  const modThree = modulo(__, 3)
  const elevate = (number) => number * number

  /** Compare Length */
  const isLengthLessThanTen = compose(lessThanTen, length)
  const isLengthMoreThanTwo = compose(greaterThanTwo, length)

  /** API */
  const changeBaseApi = api.get("https://api.tech/numbers/base")
  const getRandomAnimalApi = api.get(__, {})

  /** URL */
  const concatUrl = concat("https://animals.tech/")
  const getResult = prop("result")

  /** Handlers */
  const handleValidationError = () => handleError("ValidationError")
  const handlePromiseError = (e) => handleError(e)

  //

  const setParams = assoc("number", __, { from: "10", to: "2" })
  const logAnimal = compose(handleSuccess, getResult)

  const isValidNumber = allPass([
    isLengthMoreThanTwo,
    isLengthLessThanTen,
    isPositive,
    matchesNumberPattern
  ])

  const getRandomAnimal = compose(
    andThen(logAnimal),
    getRandomAnimalApi,
    concatUrl
  )

  const calculateBinary = compose(
    getRandomAnimal,
    toString,
    tap(writeLog),
    modThree,
    tap(writeLog),
    elevate,
    tap(writeLog),
    length,
    tap(writeLog),
    getResult
  )

  const calculateNumber = compose(
    otherwise(handlePromiseError),
    andThen(calculateBinary),
    changeBaseApi,
    setParams,
    toString,
    tap(writeLog),
    round,
    toNumber
  )

  const validateNumber = ifElse(
    isValidNumber,
    calculateNumber,
    handleValidationError
  )

  const app = compose(validateNumber, tap(writeLog))
  app(value)
}

export default processSequence
