
module.exports = function () {

    return {
        /**
        * Return an object containing headers to be setted to response
        *
        * @param page {int} - current page being accessed
        * @param size {int} - page size
        * @param count {int} - count of the entire collection instances
        * */
        getResponseHeaders: function (page, size, count) {
            var totalPages = Math.floor(count/size) + (count % size > 0 ? 1 : 0);

            var headers = {
                'x-pagination-page': page,
                'x-pagination-page-size': size,
                'x-pagination-total-pages': totalPages
            }

            if (page > 0 && page < totalPages) {
                headers['x-pagination-previous'] = page - 1;
            }

            if (page >= 0 && page < totalPages -1) {
                headers['x-pagination-next'] = page + 1;   
            }

            if (page >= totalPages) {
                headers['x-pagination-previous'] = totalPages - 1;
            }

            if (page < 0) {
                headers['x-pagination-next'] = 0;  
            }

            return headers;
        }
    };
};