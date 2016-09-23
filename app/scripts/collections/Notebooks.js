import _ from 'underscore';
import Pageable from './Pageable';
import Notebook from '../models/Notebook';

/**
 * Notebooks collection.
 *
 * @class
 * @extends Pageable
 * @license MPL-2.0
 */
class Notebooks extends Pageable {

    get model() {
        return Notebook;
    }

    /**
     * Conditions by which notebooks will be filtered.
     *
     * @returns {Object}
     */
    get conditions() {
        return {
            active: {trash: 0},
        };
    }

    /**
     * Sort notebooks by the these fields.
     *
     * @returns {Object} field => asc|desc
     */
    get comparators() {
        const {sortField, sortDirection} = this.options;
        return {
            [sortField || 'name']: (sortDirection || 'desc'),
        };
    }

    constructor(options) {
        super(options);

        // Disable pagination
        this.pagination = {perPage: 0};
    }

    /**
     * Initialize.
     *
     * @param {Object} options
     * @param {String} (options.sortField) - field by which notebooks will be sorted
     * @param {String} (options.sortDirection) - (asc|desc)
     */
    initialize(options) {
        this.options = options;
    }

    /**
     * Build a tree structure.
     *
     * @param {Array} parents = this.getRoots()
     * @param {Array} tree = []
     */
    getTree(parents = this.getRoots(), tree = []) {
        _.each(parents, model => {
            tree.push(model);

            // Every child notebook can have its own children
            const children = this.getChildren(model.id);
            if (children.length > 0) {
                this.getTree(children, tree);
            }
        });

        return tree;
    }

    /**
     * Filter to parent notebooks.
     *
     * @returns {Array} only parent notebooks.
     */
    getRoots() {
        return this.where({parentId: '0'});
    }

    /**
     * Find all child notebooks of a notebook.
     *
     * @param {String} parentId - parent notebook ID
     * @returns {Array}
     */
    getChildren(parentId) {
        return this.where({parentId});
    }

    /**
     * Return only notebooks that are not related to a specified notebook.
     *
     * @param {String} id - a notebook ID
     * @returns {Array}
     */
    rejectTree(id) {
        const ids = [id];

        return this.filter(model => {
            const {id, parentId} = model.attributes;

            if (_.indexOf(ids, id) > -1 || _.indexOf(ids, parentId) > -1) {
                /*
                 * Save the ID of a notebook because it might have
                 * its own nested notebooks.
                 */
                ids.push(model.id);
                return false;
            }

            return true;
        });
    }

}

export default Notebooks;
