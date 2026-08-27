import { expect } from 'chai';
import sinon from 'sinon';
import Note from '../../../src/models/Note.js';
import * as noteService from '../../../src/services/noteService.js';

describe('Unit: noteService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('createNote', () => {
    it('should create a note tied to the given user', async () => {
      sinon.stub(Note, 'create').resolves({ _id: 'note1', title: 'Test', content: 'Body', user: 'user1' });

      const note = await noteService.createNote({ title: 'Test', content: 'Body', userId: 'user1' });

      expect(note.user).to.equal('user1');
    });
  });

  describe('getNotesByUser with search', () => {
    it('should add a case-insensitive $or filter when a search term is given', async () => {
      const stub = sinon.stub(Note, 'find').returns({ sort: sinon.stub().resolves([]) });

      await noteService.getNotesByUser('user1', 'grocery');

      const queryArg = stub.firstCall.args[0];
      expect(queryArg.user).to.equal('user1');
      expect(queryArg.$or).to.be.an('array').with.lengthOf(2);
    });

    it('should not add a search filter when no search term is given', async () => {
      const stub = sinon.stub(Note, 'find').returns({ sort: sinon.stub().resolves([]) });

      await noteService.getNotesByUser('user1');

      const queryArg = stub.firstCall.args[0];
      expect(queryArg).to.deep.equal({ user: 'user1' });
    });
  });

  describe('getNotesByUser', () => {
    it('should return all notes belonging to the user', async () => {
      const fakeNotes = [{ title: 'B' }, { title: 'A' }];
      sinon.stub(Note, 'find').returns({ sort: sinon.stub().resolves(fakeNotes) });

      const notes = await noteService.getNotesByUser('user1');

      expect(notes).to.deep.equal(fakeNotes);
    });
  });

  describe('getNoteById', () => {
    it('should return the note when it belongs to the user', async () => {
      sinon.stub(Note, 'findOne').resolves({ _id: 'note1', title: 'Test' });

      const note = await noteService.getNoteById('note1', 'user1');

      expect(note.title).to.equal('Test');
    });

    it('should throw a 404 error when the note does not exist for this user', async () => {
      sinon.stub(Note, 'findOne').resolves(null);

      try {
        await noteService.getNoteById('note1', 'user1');
        expect.fail('Expected getNoteById to throw');
      } catch (error) {
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('updateNote', () => {
    it('should only apply allowed fields (title, content), never user', async () => {
      const stub = sinon.stub(Note, 'findOneAndUpdate').resolves({ _id: 'note1', title: 'New title' });

      await noteService.updateNote('note1', 'user1', {
        title: 'New title',
        user: 'someone-elses-id',
      });

      const updatePayload = stub.firstCall.args[1];
      expect(updatePayload).to.deep.equal({ title: 'New title' });
    });

    it('should throw a 404 error when the note does not exist for this user', async () => {
      sinon.stub(Note, 'findOneAndUpdate').resolves(null);

      try {
        await noteService.updateNote('note1', 'user1', { title: 'X' });
        expect.fail('Expected updateNote to throw');
      } catch (error) {
        expect(error.statusCode).to.equal(404);
      }
    });
  });

  describe('deleteNote', () => {
    it('should delete and return the note when it belongs to the user', async () => {
      sinon.stub(Note, 'findOneAndDelete').resolves({ _id: 'note1' });

      const note = await noteService.deleteNote('note1', 'user1');

      expect(note._id).to.equal('note1');
    });

    it('should throw a 404 error when the note does not exist for this user', async () => {
      sinon.stub(Note, 'findOneAndDelete').resolves(null);

      try {
        await noteService.deleteNote('note1', 'user1');
        expect.fail('Expected deleteNote to throw');
      } catch (error) {
        expect(error.statusCode).to.equal(404);
      }
    });
  });
});
