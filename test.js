function foreach(array, callback) {
    for (i = 0; i < array.length; i++) {
        callback(array[i], i)
    }
}
let array = [1, 2, 34]

foreach(array, (arr, index) => {
    console.log(arr, index)
})