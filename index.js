const inquirer = require('inquirer');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const _ = require('lodash')

async function showSelectList(list) {
    return await inquirer
        .prompt([
            {
                type: 'checkbox',
                message: 'Select images that you want to delete',
                name: 'images',
                choices: list,
            }
        ])
}

async function getImageList() {
    return await exec('docker images --format "{{.ID}} {{.Repository}}"')
}

async function deleteImageList(imageIdList) {
    const imageString = _.join(imageIdList, ' ')
    console.log('Will delete the following images: ', imageString);
    return await exec(`docker rmi -f ${imageString}`)
}


async function main() {
    const imageObject = await getImageList()
    console.log("List: ", imageObject.stdout);

    const imageList = imageObject
        .stdout
        .split('\n')
        .map(entry => {
            const splitEntry = entry.split(' ')
            return {
                value: splitEntry[0],
                name: splitEntry[1]
            }
        })

    const imagesToDelete = await showSelectList(imageList)
    if (imagesToDelete.images.length < 1) {
        console.log('No images selected');
    } else {
        const deleteResult = await deleteImageList(imagesToDelete.images)
        console.log(`${deleteResult.stdout}`);
        console.log('Done!')
    }
}

main()