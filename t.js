const create = (details = {}, callback) => {
  // saving to database.
  // if success
  const detailsFromDb = {}
  callback(null, detailsFromDb)
  // if failure
  callback(new Error, null)
}