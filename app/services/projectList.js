/* eslint-disable class-methods-use-this */
import Constants from '../constants/constants';

const fs = require('fs');

const DefaultProjectListFile = '.statwrap-projects.json';

export { DefaultProjectListFile };

export default class ProjectListService {
  // Toggle the status of a project on our list as a 'Favorite' project
  // return: true if the project was updated, false otherwise
  toggleProjectFavorite(projectId, filePath = DefaultProjectListFile) {
    let projectList = [];
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const data = fs.readFileSync(filePath);
    projectList = JSON.parse(data.toString());
    const project = projectList.find(x => x.id === projectId);
    if (!project) {
      return false;
    }

    project.favorite = !project.favorite;
    fs.writeFileSync(filePath, JSON.stringify(projectList));
    return true;
  }

  // Add a project to the user's list of projects.
  appendAndSaveProjectToList(project, filePath = DefaultProjectListFile) {
    // If the project is invalid, we won't append it to the list
    this.validateProjectListEntry(project);

    let projectList = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      projectList = JSON.parse(data.toString());
    }

    // If we have a match based on ID or path, don't add it again.
    if (!projectList.some(x => x.id === project.id || x.path === project.path)) {
      projectList.push(project);
      fs.writeFileSync(filePath, JSON.stringify(projectList));
    }
  }

  validateProjectListEntry(project) {
    if (!project) {
      throw new Error('The project is empty or undefined');
    }

    if (!project.id || project.id.trim() === '') {
      throw new Error('The project ID is required, but is currently empty');
    }

    if (!project.path || project.path.trim() === '') {
      throw new Error('The project path is required, but is currently empty');
    }
  }

  loadProjectListFromFile(filePath = DefaultProjectListFile) {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath);
    const projects = JSON.parse(data.toString());
    if (!projects) {
      return [];
    }

    // We are doing a little normalizing for our string comparison.  If one
    // is null and the other is a blank string, it's okay if they match.
    return projects.sort((a, b) => {
      // eslint-disable-next-line prettier/prettier
      const stringA = (a && a.name) ? a.name.toLowerCase() : Constants.UndefinedDefaults.PROJECT;
      // eslint-disable-next-line prettier/prettier
      const stringB = (b && b.name) ? b.name.toLowerCase() : Constants.UndefinedDefaults.PROJECT;
      return stringA.localeCompare(stringB);
    });
  }

  loadProjectListFromFileStub() {
    return [
      {
        id: 'd01d2925-f6ff-4f8e-988f-fca2ee193427',
        name: 'Local project using relative path',
        favorite: true,
        lastAccessed: '2020-04-21T21:21:27.041Z',
        path: '~/Development/StatTag/StatWrapProjects/project1'
      },
      {
        id: '6ff79e02-4f24-4948-ac77-f3f1b67064e5',
        name: 'XuS_775 - Shared drive',
        favorite: false,
        lastAccessed: '2020-04-21T21:21:27.041Z',
        // eslint-disable-next-line prettier/prettier
        path: 'smb://fsmresfiles.fsm.northwestern.edu/fsmresfiles/NUCATS/NUCATS_Shared/BERDShared/StatWrap/Test folders/XuS_775'
      },
      {
        id: '6ff79e02-4f24-4948-ac77-f3f1b67064e6',
        name: 'Invalid project',
        favorite: false,
        lastAccessed: '2020-04-21T21:21:27.041Z',
        path: 'smb://fsmresfiles.fsm.northwestern.edu/fsmresfiles/Project3'
      }
    ];
  }
}