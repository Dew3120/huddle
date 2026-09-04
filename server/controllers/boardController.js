import * as boardService from '../services/boardService.js';

export async function list(req, res) {
  res.json({
    data: await boardService.listBoards(req.user),
  });
}

export async function create(req, res) {
  const board = await boardService.createBoard(req.body, req.user);

  res.status(201).location(`/api/boards/${board.id}`).json({
    data: board,
  });
}

export async function listTasks(req, res) {
  res.json(
    await boardService.listBoardTasks(
      req.params.id,
      req.validated.query,
      req.user,
    ),
  );
}
