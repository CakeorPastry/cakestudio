-- 🏀 PerfectPass LocalScript with Targeting, Cooldown, Animation & ABC

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UIS = game:GetService("UserInputService")

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local team = player.Team
local gui = Instance.new("ScreenGui", player:WaitForChild("PlayerGui"))
gui.Name = "PerfectPassGUI"

local button = Instance.new("TextButton")
button.Size = UDim2.new(0, 120, 0, 40)
button.Position = UDim2.new(0, 100, 0, 100)
button.Text = "Perfect Pass"
button.BackgroundColor3 = Color3.fromRGB(65, 150, 255)
button.TextColor3 = Color3.new(1, 1, 1)
button.Font = Enum.Font.GothamBold
button.TextSize = 14
button.Parent = gui

local dragging, offset = false, Vector2.zero
button.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		dragging = true
		offset = input.Position - button.AbsolutePosition
	end
end)
button.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.MouseButton1 then
		dragging = false
	end
end)
UIS.InputChanged:Connect(function(input)
	if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
		local newPos = input.Position - offset
		button.Position = UDim2.new(0, newPos.X, 0, newPos.Y)
	end
end)

-- Cooldown control
local canUse = true

-- 👤 Manual teammate target finder
local function getBestTarget()
	local camera = workspace.CurrentCamera
	local hrp = character:FindFirstChild("HumanoidRootPart")
	if not hrp then return end

	local candidates = {}
	local furthest, furthestDist = nil, -1
	local bestInView, viewAngle = nil, math.huge

	for _, p in ipairs(Players:GetPlayers()) do
		if p ~= player and p.Team == team and p.Character and p.Character:FindFirstChild("HumanoidRootPart") then
			local targetHRP = p.Character.HumanoidRootPart
			local dirToTarget = (targetHRP.Position - hrp.Position).Unit
			local cameraDir = camera.CFrame.LookVector
			local angle = math.deg(math.acos(dirToTarget:Dot(cameraDir)))

			local dist = (hrp.Position - targetHRP.Position).Magnitude

			if dist > furthestDist then
				furthest = p
				furthestDist = dist
			end

			if angle <= 25 then -- 👀 close to where player is looking
				if angle < viewAngle then
					viewAngle = angle
					bestInView = p
				end
			end
		end
	end

	return bestInView or furthest
end

-- 🏃 ABC Simulation
local ABC = {}
ABC.Connections = {}
function ABC:Connect(signal, func)
	local conn = signal:Connect(func)
	table.insert(self.Connections, conn)
end
function ABC:Clean()
	for _, conn in ipairs(self.Connections) do
		if conn.Disconnect then conn:Disconnect() end
	end
	self.Connections = {}
end

-- Main ability
local function PerfectPass()
	if not canUse then warn("Ability is on cooldown."); return end

	local hasBall = character:FindFirstChild("Values") and character.Values:FindFirstChild("HasBall")
	local football = character:FindFirstChild("Football")
	local hrp = character:FindFirstChild("HumanoidRootPart")

	if not (hasBall and hasBall.Value) or not football or not hrp then
		warn("Missing ball, HRP or you don't have the ball.")
		return
	end

	local target = getBestTarget()
	if not target or not target.Character or not target.Character:FindFirstChild("HumanoidRootPart") then
		warn("No valid teammate to pass to.")
		return
	end
	local targetHRP = target.Character.HumanoidRootPart

	-- Animation
	local anim = Instance.new("Animation")
	anim.AnimationId = "rbxassetid://83376040878208"
	local track = character:FindFirstChildOfClass("Humanoid"):LoadAnimation(anim)
	track.Priority = Enum.AnimationPriority.Action4
	track:Play()

	-- Cooldown
	canUse = false
	task.delay(1, function()
		canUse = true
	end)

local args = {
	5, 
	[4] = vector.create(5, 5, 5)
}
game:GetService("ReplicatedStorage"):WaitForChild("Packages"):WaitForChild("Knit"):WaitForChild("Services"):WaitForChild("BallService"):WaitForChild("RE"):WaitForChild("Shoot"):FireServer(unpack(args))

	-- Initial pass
	local dir = (targetHRP.Position + targetHRP.AssemblyLinearVelocity * Vector3.new(1, 0, 1) - hrp.Position).Unit + Vector3.new(0, 0.5, 0)
	local speed = math.clamp((targetHRP.Position - hrp.Position).Magnitude * 1.5, 0, 150)
	football.AssemblyLinearVelocity = dir * speed




	-- Ball tracking
	local t0 = tick()
	ABC:Clean()
	ABC:Connect(RunService.Heartbeat, function(dt)
		if tick() - t0 > 4 or not football or not football.Parent then
			ABC:Clean()
			return
		end
		dir = dir:Lerp((targetHRP.Position - football.Position).Unit + Vector3.new(0, 0.35, 0), 6.5 * dt)
		speed = math.clamp((targetHRP.Position - hrp.Position).Magnitude * 2.75, 0, 150)
		football.AssemblyLinearVelocity = dir * speed
	end)
end

-- 🎯 GUI button
button.MouseButton1Click:Connect(PerfectPass) 
team = player.Team