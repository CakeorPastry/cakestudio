local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local player = Players.LocalPlayer

-- GUI
local screenGui = Instance.new("ScreenGui", player:WaitForChild("PlayerGui"))
screenGui.Name = "CurvePassGui"
screenGui.ResetOnSpawn = false

local button = Instance.new("TextButton")
button.Size = UDim2.new(0, 120, 0, 40)
button.Position = UDim2.new(0, 100, 0, 300)
button.BackgroundColor3 = Color3.fromRGB(255, 80, 80)
button.Text = "Write back"
button.TextScaled = true
button.Draggable = true
button.Active = true
button.Parent = screenGui

-- Find football
local function findFootball()
	return workspace:FindFirstChild("Football")
end

-- Get teammates
local function getTeammates()
	local teammates = {}
	for _, plr in pairs(Players:GetPlayers()) do
		if plr ~= player and plr.Team == player.Team then
			local char = plr.Character
			if char and char:FindFirstChild("HumanoidRootPart") and char:FindFirstChild("Humanoid") and char.Humanoid.Health > 0 then
				table.insert(teammates, char)
			end
		end
	end
	return teammates
end

-- Find best pass target
local function findTargetTeammate()
	local cam = workspace.CurrentCamera
	local bestDot = -1
	local bestDist = 0
	local chosen

	for _, teammate in pairs(getTeammates()) do
		local dir = (teammate.HumanoidRootPart.Position - cam.CFrame.Position).Unit
		local dot = cam.CFrame.LookVector:Dot(dir)
		local dist = (teammate.HumanoidRootPart.Position - cam.CFrame.Position).Magnitude

		if dot > 0.5 and dist > bestDist then
			bestDist = dist
			bestDot = dot
			chosen = teammate
		end
	end
	return chosen
end

-- Launch crazy curve pass
local function launchCurvePass(ball, target)
	local root = target:FindFirstChild("HumanoidRootPart")
	if not root then return end

	local startPos = ball.Position
	local endPos = root.Position + Vector3.new(0, 2.5, 0)

	local direction = (endPos - startPos).Unit
	local bv = Instance.new("BodyVelocity")
	bv.MaxForce = Vector3.new(1e5, 1e5, 1e5)
	bv.P = 1250
	bv.Velocity = direction * 120
	bv.Name = "CurveVelocity"
	bv.Parent = ball

	local time = 0
	local connection
	connection = RunService.RenderStepped:Connect(function(dt)
		if not bv.Parent or not ball.Parent then
			connection:Disconnect()
			return
		end
		time += dt

		local cam = workspace.CurrentCamera
		local right = cam.CFrame.RightVector
		local up = cam.CFrame.UpVector

		local waveX = math.sin(time * 6) * 50
		local waveY = math.sin(time * 4) * 80

		bv.Velocity += (right * waveX + up * waveY) * dt
	end)

	task.delay(2.5, function()
		if bv then bv:Destroy() end
	end)
end

-- Button logic
button.Activated:Connect(function()
	local char = player.Character
	if not char then return end

	local ball = findFootball()
	if not ball or not ball:IsDescendantOf(char) then return end

	-- Try releasing ball (jump + force parent to workspace)
	char:FindFirstChildOfClass("Humanoid"):ChangeState(Enum.HumanoidStateType.Jumping)
	ball.Parent = workspace

	-- Wait just a bit to ensure ball is free
	task.wait(0.15)

	local target = findTargetTeammate()
	if not target then warn("No teammate found!") return end

	launchCurvePass(ball, target)
end)