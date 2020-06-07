export class Utils {

  /**
   * chunkArray
   * @param array Array to be chunked into groups
   * @param size the size of the chunks
   */

  static chunkArray(array, size) {
    if(array.length <= size){
        return [array]
    }
    return [array.slice(0,size), ...Utils.chunkArray(array.slice(size), size)]
 }
}
