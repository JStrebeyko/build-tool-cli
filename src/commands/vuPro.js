const build = require('../helpers/build');
const { repositories } = require('../../config.json');
const getPathToRepo = require('../helpers/getPathToRepo');
const createZip = require('../setup/createZip');
const replaceStringInFile = require('../helpers/replaceStringInFile');
const searchFileByExtension = require('../helpers/searchFileByExtension');
const copyFiles = require('../helpers/copyFiles');
const deleteFiles = require('../helpers/deleteFiles');
const path = require('path');
const { RE_PRO } = require('../constans/packages-types');

const vuPro = async ({ version, lastVersionNumber }) => {
  const baseRepoName = 'vu-pro';
  const targetRepoName = 'vue-demo';

  const baseRepoPath = getPathToRepo(baseRepoName);
  const baseRepoDocsPath = path.join(baseRepoPath, 'docs');

  const targetRepoPath = getPathToRepo(targetRepoName);
  const targetRepoSrcPath = path.join(targetRepoPath, 'src');

  const baseRepoFilesToEdit = repositories[baseRepoName].filesToEdit;
  const targetRepoFilesToEdit = repositories[targetRepoName].filesToEdit;
  const targetRepoFilesToCopy = repositories[targetRepoName].filesToCopy;

  replaceStringInFile(
    baseRepoFilesToEdit,
    baseRepoPath,
    lastVersionNumber,
    version
  );

  build(baseRepoPath, true);

  const lastTgzPackage = searchFileByExtension(targetRepoPath, '.tgz');
  lastTgzPackage && deleteFiles(lastTgzPackage, targetRepoPath);

  let newTgzPackage = searchFileByExtension(baseRepoPath, '.tgz');
  copyFiles(newTgzPackage, baseRepoPath, targetRepoPath);
  deleteFiles(newTgzPackage, baseRepoPath);

  replaceStringInFile(
    targetRepoFilesToEdit,
    targetRepoPath,
    lastVersionNumber,
    version
  );

  copyFiles(targetRepoFilesToCopy, baseRepoDocsPath, targetRepoSrcPath);

  await createZip(targetRepoName, RE_PRO);
};

module.exports = vuPro;
