import * as boardService from '../services/boardService.js';

export function list(req, res) {
  res.json({
    data: boardService.listBoards(req.user),
  });
}

export function create(req, res) {
  const board = boardService.createBoard(req.body, req.user);

  res.status(201).location(`/api/boards/${board.id}`).json({
    data: board,
  });
}

export function listTasks(req, res) {
  res.json(boardService.listBoardTasks(req.params.id, req.query, req.user));
}
