//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Function to create a new pet colour on breed
    /* ------------------------------------------------------------------------------ */

    pet_create_new_colour: function(colourOne,colourTwo){
        var newcolour = [0,0,0]; // empty colour (black)
        var colourDeviation = Math.floor((Math.random()*11)-5)/100; // deviation -0.05 || -0.04 || -0.03 || -0.02 || -0.01 || 0 || 0.01 || 0.02 || 0.03 || 0.04 || 0.05

        if(colourOne[0] != 0 || colourTwo[0] != 0)
            newcolour[0] = ((colourOne[0] / 2 + colourTwo[0] / 2) + colourDeviation).toFixed(2);
        if(colourOne[1] != 0 || colourTwo[1] != 0)
            newcolour[1] = ((colourOne[1] / 2 + colourTwo[1] / 2) + colourDeviation).toFixed(2);
        if(colourOne[2] != 0 || colourTwo[2] != 0)
            newcolour[2] = ((colourOne[2] / 2 + colourTwo[2] / 2) + colourDeviation).toFixed(2);

        if (newcolour[0] < 0)
            newcolour[0] = 0;

        if (newcolour[0] > 1)
            newcolour[0] = 1;

        if (newcolour[1] < 0)
            newcolour[1] = 0;

        if (newcolour[1] > 1)
            newcolour[1] = 1;

        if (newcolour[2] < 0)
            newcolour[2] = 0;

        if (newcolour[2] > 1)
            newcolour[2] = 1;

        return newcolour;
    },

    /* ------------------------------------------------------------------------------ */
    // Function to create rgba colour in % out of vector colour
    /* ------------------------------------------------------------------------------ */

    pet_create_rgb_percent_colour: function(colour){
        var rgbColourInPercent = [(colour[0]*100).toFixed(0),(colour[1]*100).toFixed(0),(colour[2]*100).toFixed(0)]
        return rgbColourInPercent;
    }
    
};